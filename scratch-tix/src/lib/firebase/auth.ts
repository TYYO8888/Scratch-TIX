import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User as AppUser, Organization } from '@/lib/types/user';

// Auth providers
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  displayName: string,
  organizationName: string
) => {
  try {
    // Create user account
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Update user profile
    await updateProfile(user, { displayName });

    // Send email verification
    await sendEmailVerification(user);

    // Create organization
    const orgId = `org_${user.uid}`;
    const organization: Omit<Organization, 'id'> = {
      name: organizationName,
      plan: 'free',
      ownerId: user.uid,
      members: [user.uid],
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
      },
      settings: {
        maxCampaigns: 3,
        maxParticipants: 1000,
        features: [],
        apiAccess: false,
        whiteLabeling: false,
      },
      billing: {
        cancelAtPeriodEnd: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'organizations', orgId), {
      ...organization,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create user document
    const appUser: Omit<AppUser, 'id'> = {
      email: user.email!,
      displayName: displayName,
      photoURL: user.photoURL,
      organizationId: orgId,
      role: 'owner',
      permissions: ['campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...appUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { user, organization: { id: orgId, ...organization }, error: null };
  } catch (error: any) {
    return { user: null, organization: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user and organization for Google sign-in
      const orgId = `org_${user.uid}`;
      const organization: Omit<Organization, 'id'> = {
        name: `${user.displayName}'s Organization`,
        plan: 'free',
        ownerId: user.uid,
        members: [user.uid],
        branding: {
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
        },
        settings: {
          maxCampaigns: 3,
          maxParticipants: 1000,
          features: [],
          apiAccess: false,
          whiteLabeling: false,
        },
        billing: {
          cancelAtPeriodEnd: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'organizations', orgId), {
        ...organization,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const appUser: Omit<AppUser, 'id'> = {
        email: user.email!,
        displayName: user.displayName!,
        photoURL: user.photoURL,
        organizationId: orgId,
        role: 'owner',
        permissions: ['campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...appUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user data
export const getCurrentUserData = async (uid: string): Promise<AppUser | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as AppUser;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Get user's organization
export const getUserOrganization = async (organizationId: string): Promise<Organization | null> => {
  try {
    const orgDoc = await getDoc(doc(db, 'organizations', organizationId));
    if (orgDoc.exists()) {
      return { id: orgDoc.id, ...orgDoc.data() } as Organization;
    }
    return null;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
};
