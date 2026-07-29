import { collection, onSnapshot, setDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onEmpty?: () => void
) {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          if (onEmpty) onEmpty();
          return;
        }
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as T);
        });
        onUpdate(items);
      },
      (error) => {
        console.warn(`Firestore listener error on ${collectionName}:`, error);
      }
    );
  } catch (e) {
    console.warn(`Firestore subscribe failed for ${collectionName}:`, e);
    return () => {};
  }
}

export async function saveDocument<T extends { id: string }>(collectionName: string, data: T) {
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data, { merge: true });
  } catch (e) {
    console.warn(`Firestore saveDocument failed for ${collectionName}/${data.id}:`, e);
  }
}

export async function removeDocument(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn(`Firestore removeDocument failed for ${collectionName}/${id}:`, e);
  }
}

export async function seedInitialCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log(`Seeding initial data to Firestore collection: ${collectionName}`);
      for (const item of initialData) {
        await setDoc(doc(db, collectionName, item.id), item);
      }
    }
  } catch (e) {
    console.warn(`Failed to seed ${collectionName}:`, e);
  }
}
