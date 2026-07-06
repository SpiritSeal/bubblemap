// @vitest-environment node
/**
 * Security-rules tests for the `mindmaps` collection (issue #188).
 *
 * These lock in the fix for the privilege-escalation hole where the
 * public-edit flag was read from the attacker-controlled incoming write
 * (`request.resource.data`) instead of the existing document.
 *
 * Runs against the Firestore emulator: `npm run test` (emulators:exec sets
 * FIRESTORE_EMULATOR_HOST). Skipped when no emulator is available.
 */
import { readFileSync } from 'fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const OWNER = 'owner-uid';
const STRANGER = 'stranger-uid';

const baseMap = (overrides: Record<string, unknown> = {}) => ({
  title: 'Test Map',
  nodes: [{ parent: 0, text: 'root', id: 0 }],
  metadata: {
    createdAt: new Date(),
    createdBy: OWNER,
    updatedAt: new Date(),
    updatedBy: OWNER,
    everUpdatedBy: [OWNER],
  },
  permissions: {
    owner: OWNER,
    isPublic: false,
    canPublicEdit: false,
  },
  ...overrides,
});

const publicViewOnly = () =>
  baseMap({
    permissions: { owner: OWNER, isPublic: true, canPublicEdit: false },
  });

const publicEditable = () =>
  baseMap({
    permissions: { owner: OWNER, isPublic: true, canPublicEdit: true },
  });

describe.skipIf(!process.env.FIRESTORE_EMULATOR_HOST)(
  'firestore.rules: mindmaps',
  () => {
    let testEnv: RulesTestEnvironment;

    const seed = async (id: string, data: Record<string, unknown>) => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('mindmaps').doc(id).set(data);
      });
    };

    const as = (uid: string | null) =>
      (uid
        ? testEnv.authenticatedContext(uid)
        : testEnv.unauthenticatedContext()
      ).firestore();

    beforeAll(async () => {
      testEnv = await initializeTestEnvironment({
        projectId: 'demo-bubblemap-rules',
        firestore: { rules: readFileSync('firestore.rules', 'utf8') },
      });
    });

    beforeEach(async () => {
      await testEnv.clearFirestore();
    });

    afterAll(async () => {
      await testEnv.cleanup();
    });

    describe('the original exploits stay dead', () => {
      it('denies writes to a public VIEW-ONLY map even when the payload smuggles canPublicEdit: true', async () => {
        await seed('map1', publicViewOnly());
        await assertFails(
          as(STRANGER)
            .collection('mindmaps')
            .doc('map1')
            .set(
              {
                title: 'hijacked',
                permissions: {
                  owner: OWNER,
                  isPublic: true,
                  canPublicEdit: true,
                },
              },
              { merge: true },
            ),
        );
      });

      it('denies a public editor changing permissions (ownership takeover)', async () => {
        await seed('map1', publicEditable());
        await assertFails(
          as(STRANGER)
            .collection('mindmaps')
            .doc('map1')
            .set(
              {
                permissions: {
                  owner: STRANGER,
                  isPublic: false,
                  canPublicEdit: false,
                },
              },
              { merge: true },
            ),
        );
      });

      it('denies unauthenticated writes even on public-editable maps', async () => {
        await seed('map1', publicEditable());
        await assertFails(
          as(null)
            .collection('mindmaps')
            .doc('map1')
            .set({ title: 'anon edit' }, { merge: true }),
        );
      });

      it('denies creating a map owned by someone else', async () => {
        await assertFails(
          as(STRANGER).collection('mindmaps').doc('planted').set(baseMap()), // owner/createdBy/everUpdatedBy are OWNER's uid
        );
      });
    });

    describe('create', () => {
      it('allows a signed-in user to create their own map', async () => {
        const db = as(STRANGER);
        await assertSucceeds(
          db
            .collection('mindmaps')
            .doc('mine')
            .set(
              baseMap({
                metadata: {
                  createdAt: new Date(),
                  createdBy: STRANGER,
                  updatedAt: new Date(),
                  updatedBy: STRANGER,
                  everUpdatedBy: [STRANGER],
                },
                permissions: {
                  owner: STRANGER,
                  isPublic: false,
                  canPublicEdit: false,
                },
              }),
            ),
        );
      });

      it('denies unauthenticated creates', async () => {
        await assertFails(
          as(null).collection('mindmaps').doc('x').set(baseMap()),
        );
      });

      it('denies creates with unexpected top-level fields', async () => {
        await assertFails(
          as(OWNER)
            .collection('mindmaps')
            .doc('x')
            .set(baseMap({ isAdmin: true })),
        );
      });

      it('denies creates with a non-string title', async () => {
        await assertFails(
          as(OWNER)
            .collection('mindmaps')
            .doc('x')
            .set(baseMap({ title: 42 })),
        );
      });
    });

    describe('update', () => {
      it('allows the owner to edit and to toggle sharing', async () => {
        await seed('map1', baseMap());
        const db = as(OWNER);
        await assertSucceeds(
          db
            .collection('mindmaps')
            .doc('map1')
            .set(
              {
                title: 'renamed',
                permissions: {
                  owner: OWNER,
                  isPublic: true,
                  canPublicEdit: true,
                },
              },
              { merge: true },
            ),
        );
      });

      it('denies the owner transferring ownership', async () => {
        await seed('map1', baseMap());
        await assertFails(
          as(OWNER)
            .collection('mindmaps')
            .doc('map1')
            .set(
              {
                permissions: {
                  owner: STRANGER,
                  isPublic: false,
                  canPublicEdit: false,
                },
              },
              { merge: true },
            ),
        );
      });

      it('allows a signed-in editor to edit nodes on a public-EDITABLE map (permissions untouched)', async () => {
        await seed('map1', publicEditable());
        await assertSucceeds(
          as(STRANGER)
            .collection('mindmaps')
            .doc('map1')
            .set(
              {
                nodes: [
                  { parent: 0, text: 'root', id: 0 },
                  { parent: 0, text: 'new idea', id: 1 },
                ],
                metadata: {
                  updatedAt: new Date(),
                  updatedBy: STRANGER,
                  everUpdatedBy: [OWNER, STRANGER],
                },
              },
              { merge: true },
            ),
        );
      });

      // The MindMap editor writes node changes inside a transaction as a
      // full `nodes` list plus dot-path metadata updates (see commitNodes in
      // src/pages/MindMap/index.tsx). Keep the rules accepting that shape.
      const transactionShapedWrite = (uid: string) => ({
        nodes: [
          { parent: '0', text: 'root', id: '0' },
          { parent: '0', text: 'new idea', id: 'b28cbbe6-uuid-style-id' },
        ],
        'metadata.updatedAt': firebase.firestore.FieldValue.serverTimestamp(),
        'metadata.updatedBy': uid,
        'metadata.everUpdatedBy': firebase.firestore.FieldValue.arrayUnion(uid),
      });

      it("allows the owner's transaction-shaped node write", async () => {
        await seed('map1', baseMap());
        await assertSucceeds(
          as(OWNER)
            .collection('mindmaps')
            .doc('map1')
            .update(transactionShapedWrite(OWNER)),
        );
      });

      it("allows a public editor's transaction-shaped node write", async () => {
        await seed('map1', publicEditable());
        await assertSucceeds(
          as(STRANGER)
            .collection('mindmaps')
            .doc('map1')
            .update(transactionShapedWrite(STRANGER)),
        );
      });

      it("denies a stranger's transaction-shaped write on a view-only map", async () => {
        await seed('map1', publicViewOnly());
        await assertFails(
          as(STRANGER)
            .collection('mindmaps')
            .doc('map1')
            .update(transactionShapedWrite(STRANGER)),
        );
      });

      it('denies a non-owner editing a private map', async () => {
        await seed('map1', baseMap());
        await assertFails(
          as(STRANGER)
            .collection('mindmaps')
            .doc('map1')
            .set({ title: 'nope' }, { merge: true }),
        );
      });
    });

    describe('read', () => {
      it('allows the owner to get their private map', async () => {
        await seed('map1', baseMap());
        await assertSucceeds(
          as(OWNER).collection('mindmaps').doc('map1').get(),
        );
      });

      it('denies a stranger getting a private map', async () => {
        await seed('map1', baseMap());
        await assertFails(
          as(STRANGER).collection('mindmaps').doc('map1').get(),
        );
      });

      it('allows any signed-in user (incl. anonymous) to get a public map', async () => {
        await seed('map1', publicViewOnly());
        await assertSucceeds(
          as(STRANGER).collection('mindmaps').doc('map1').get(),
        );
      });

      it('denies unauthenticated gets of public maps (app always signs in anonymously)', async () => {
        await seed('map1', publicViewOnly());
        await assertFails(as(null).collection('mindmaps').doc('map1').get());
      });

      it("allows the app's owned-maps list query", async () => {
        await seed('map1', baseMap());
        await assertSucceeds(
          as(OWNER)
            .collection('mindmaps')
            .where('permissions.owner', '==', OWNER)
            .get(),
        );
      });

      it("allows the app's shared-with-me list query", async () => {
        await assertSucceeds(
          as(STRANGER)
            .collection('mindmaps')
            .where('metadata.everUpdatedBy', 'array-contains', STRANGER)
            .where('permissions.owner', '!=', STRANGER)
            .where('permissions.isPublic', '==', true)
            .orderBy('permissions.owner', 'desc')
            .get(),
        );
      });

      it('denies an unfiltered collection scan', async () => {
        await seed('map1', publicViewOnly());
        await assertFails(as(STRANGER).collection('mindmaps').get());
      });
    });

    describe('delete', () => {
      it('allows the owner to delete', async () => {
        await seed('map1', baseMap());
        await assertSucceeds(
          as(OWNER).collection('mindmaps').doc('map1').delete(),
        );
      });

      it('denies a stranger deleting, even on public-editable maps', async () => {
        await seed('map1', publicEditable());
        await assertFails(
          as(STRANGER).collection('mindmaps').doc('map1').delete(),
        );
      });

      it('denies other collections entirely (default deny)', async () => {
        await assertFails(as(OWNER).collection('users').doc('x').set({ a: 1 }));
      });
    });
  },
);
