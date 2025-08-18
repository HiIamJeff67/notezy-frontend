// import { ShelfManager, ShelfNode } from "../../src/shared/lib/shelfNode";
// import { UUID } from "../../src/shared/types/uuid_v4.type";

// describe("Frontend-Backend msgpack Compatibility", () => {
//   test("should encode/decode exactly like Go backend", () => {
//     // ✅ 創建純單向樹結構（沒有 parent）
//     const root: ShelfNode = {
//       id: "root-uuid" as UUID,
//       name: "Root",
//       children: {},
//       materialIds: { ["material-root" as UUID]: true },
//     };

//     const child1: ShelfNode = {
//       id: "child1-uuid" as UUID,
//       name: "Child 1",
//       children: {},
//       materialIds: { ["material-1" as UUID]: true },
//     };

//     const grandchild: ShelfNode = {
//       id: "grandchild-uuid" as UUID,
//       name: "Grandchild",
//       children: {},
//       materialIds: { ["material-2" as UUID]: true },
//     };

//     // 建立單向樹結構
//     root.children["child1-uuid" as UUID] = child1;
//     child1.children["grandchild-uuid" as UUID] = grandchild;

//     // 前端編碼 - 使用 safeEncode
//     const encoded = ShelfManager.safeEncode(root);
//     console.log("Encoded bytes length:", encoded.length);

//     // 前端解碼
//     const decoded = ShelfManager.decode(encoded);

//     // ✅ 驗證完整的樹結構
//     console.log("Decoded root:", decoded.name);
//     console.log("Root children:", Object.keys(decoded.children));

//     const decodedChild1 = decoded.children["child1-uuid" as UUID];
//     expect(decodedChild1).toBeDefined();
//     expect(decodedChild1!.name).toBe("Child 1");
//     console.log("Child1 children:", Object.keys(decodedChild1!.children));

//     const decodedGrandchild =
//       decodedChild1!.children["grandchild-uuid" as UUID];
//     expect(decodedGrandchild).toBeDefined();
//     expect(decodedGrandchild!.name).toBe("Grandchild");
//     console.log(
//       "Grandchild children:",
//       Object.keys(decodedGrandchild!.children)
//     );

//     // ✅ 驗證 materialIds
//     expect(decoded.materialIds["material-root" as UUID]).toBe(true);
//     expect(decodedChild1!.materialIds["material-1" as UUID]).toBe(true);
//     expect(decodedGrandchild!.materialIds["material-2" as UUID]).toBe(true);

//     console.log("✅ Full tree structure preserved!");
//   });

//   test("should produce identical structure to Go backend", () => {
//     const testTree: ShelfNode = {
//       id: "test-id" as UUID,
//       name: "Test",
//       children: {
//         ["branch-a" as UUID]: {
//           id: "branch-a" as UUID,
//           name: "Branch A",
//           children: {
//             ["leaf-1" as UUID]: {
//               id: "leaf-1" as UUID,
//               name: "Leaf 1",
//               children: {},
//               materialIds: { ["mat-1" as UUID]: true },
//             },
//           },
//           materialIds: {},
//         },
//         ["branch-b" as UUID]: {
//           id: "branch-b" as UUID,
//           name: "Branch B",
//           children: {},
//           materialIds: { ["mat-2" as UUID]: false },
//         },
//       },
//       materialIds: { ["root-mat" as UUID]: true },
//     };

//     // Round-trip 測試 - 使用 safeEncode
//     const encoded = ShelfManager.safeEncode(testTree);
//     const decoded = ShelfManager.decode(encoded);

//     // 深度比較
//     expect(decoded).toEqual(testTree);

//     // 驗證巢狀結構
//     const branchA = decoded.children["branch-a" as UUID]!;
//     const leaf1 = branchA.children["leaf-1" as UUID]!;

//     expect(leaf1.name).toBe("Leaf 1");
//     expect(leaf1.materialIds["mat-1" as UUID]).toBe(true);

//     console.log("✅ Nested structure identical!");
//   });
// });
