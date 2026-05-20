import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Lead, Campaign } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const LEADS_COL = 'leads';
const CAMPAIGNS_COL = 'campaigns';

export async function getLeads(): Promise<Lead[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  
  try {
    const q = query(collection(db, LEADS_COL), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
      } as Lead;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, LEADS_COL);
    return [];
  }
}

function sanitizeData(data: any) {
  const result: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      result[key] = data[key];
    }
  });
  return result;
}

export async function saveLead(lead: Partial<Lead>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User must be signed in to save leads');

  const leadId = lead.id || doc(collection(db, LEADS_COL)).id;
  const path = `${LEADS_COL}/${leadId}`;

  try {
    const sanitized = sanitizeData(lead);
    const leadData: any = {
      ...sanitized,
      id: leadId,
      ownerId: userId,
      updatedAt: serverTimestamp(),
    };

    if (lead.createdAt && lead.createdAt > 0) {
      leadData.createdAt = Timestamp.fromMillis(lead.createdAt);
    } else {
      leadData.createdAt = serverTimestamp();
    }

    await setDoc(doc(db, LEADS_COL, leadId), leadData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteLead(id: string) {
  const path = `${LEADS_COL}/${id}`;
  try {
    await deleteDoc(doc(db, LEADS_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getCampaigns(): Promise<Campaign[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  try {
    const q = query(collection(db, CAMPAIGNS_COL), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
      } as Campaign;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CAMPAIGNS_COL);
    return [];
  }
}

export async function saveCampaign(campaign: Partial<Campaign>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User must be signed in to save campaigns');

  const campaignId = campaign.id || doc(collection(db, CAMPAIGNS_COL)).id;
  const path = `${CAMPAIGNS_COL}/${campaignId}`;

  try {
    const sanitized = sanitizeData(campaign);
    const campaignData: any = {
      ...sanitized,
      id: campaignId,
      ownerId: userId,
      updatedAt: serverTimestamp(),
    };

    if (campaign.createdAt && campaign.createdAt > 0) {
      campaignData.createdAt = Timestamp.fromMillis(campaign.createdAt);
    } else {
      campaignData.createdAt = serverTimestamp();
    }

    await setDoc(doc(db, CAMPAIGNS_COL, campaignId), campaignData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
