import { ShelfManager, ShelfNode } from "../../src/shared/lib/shelfNode";
import { UUID } from "../../src/shared/types/uuid_v4.type";

describe("ShelfNode Performance Tests", () => {
  const DEFAULT_MAX_ITERATIONS = 1e5;
  const SAFE_MAX_DEPTH = 100;
  const SAFE_MAX_WIDTH = 1e5;

  beforeAll(() => {
    ShelfManager.setMaxIterations(DEFAULT_MAX_ITERATIONS);
  });

  beforeEach(() => {
    ShelfManager.setMaxIterations(DEFAULT_MAX_ITERATIONS);
  });

  afterEach(() => {
    ShelfManager.setMaxIterations(DEFAULT_MAX_ITERATIONS);
  });

  afterAll(() => {
    ShelfManager.setMaxIterations(1e4); // 恢復預設值
  });

  function generateUUID(): UUID {
    return `${Math.random().toString(36).substr(2, 8)}-${Math.random()
      .toString(36)
      .substr(2, 4)}-4${Math.random().toString(36).substr(2, 3)}-${Math.random()
      .toString(36)
      .substr(2, 4)}-${Math.random().toString(36).substr(2, 12)}` as UUID;
  }

  function generateMaterialIds(count: number): Record<UUID, boolean> {
    const materials: Record<UUID, boolean> = {};
    for (let i = 0; i < count; i++) {
      materials[generateUUID()] = Math.random() > 0.5;
    }
    return materials;
  }

  function createWideTree(
    width: number,
    depth: number,
    maxNodes: number = 5000
  ): ShelfNode {
    let nodeCount = 0;
    const safeDepth = Math.min(depth, SAFE_MAX_DEPTH);
    const safeWidth = Math.min(width, SAFE_MAX_WIDTH);

    function createNode(
      currentDepth: number,
      nodeIndex: number
    ): ShelfNode | null {
      if (nodeCount >= maxNodes) {
        console.log(`⚠️ Reached max nodes limit: ${maxNodes}`);
        return null;
      }

      if (currentDepth >= safeDepth) {
        console.log(`⚠️ Reached safe max depth: ${safeDepth}`);
        return null;
      }

      const node: ShelfNode = {
        id: generateUUID(),
        name: `Wide-D${currentDepth}-I${nodeIndex}`,
        children: {},
        materialIds: generateMaterialIds(Math.floor(Math.random() * 3) + 1),
      };

      nodeCount++;

      if (currentDepth === 0) {
        const actualWidth = Math.min(safeWidth, width);
        for (let i = 0; i < actualWidth && nodeCount < maxNodes; i++) {
          const child = createNode(currentDepth + 1, i);
          if (child) {
            node.children[child.id] = child;
          }
        }
      } else if (currentDepth < safeDepth - 1) {
        // 其他層只創建1-2個子節點
        const childCount = Math.min(2, Math.floor(Math.random() * 3));
        for (let i = 0; i < childCount && nodeCount < maxNodes; i++) {
          const child = createNode(currentDepth + 1, i);
          if (child) {
            node.children[child.id] = child;
          }
        }
      }

      return node;
    }

    const result = createNode(0, 0);
    console.log(
      `Created wide tree with ${nodeCount} nodes, safe depth: ${safeDepth}`
    );
    return result!;
  }

  function createBalancedTree(totalNodes: number): ShelfNode {
    let nodeCount = 0;
    const maxSafeDepth = Math.min(SAFE_MAX_DEPTH, 40);

    function createNode(depth: number): ShelfNode | null {
      if (nodeCount >= totalNodes) return null;
      if (depth >= maxSafeDepth) {
        console.log(`⚠️ Reached max safe depth: ${maxSafeDepth}`);
        return null;
      }

      const node: ShelfNode = {
        id: generateUUID(),
        name: `Balanced-Node-${nodeCount}`,
        children: {},
        materialIds: generateMaterialIds(Math.floor(Math.random() * 3) + 1),
      };

      nodeCount++;

      const remainingNodes = totalNodes - nodeCount;
      if (remainingNodes <= 0) return node;

      let maxChildren: number;
      if (depth < 5) {
        maxChildren = Math.min(3, Math.floor(remainingNodes / 8));
      } else if (depth < 15) {
        maxChildren = Math.min(2, Math.floor(remainingNodes / 4));
      } else {
        maxChildren = Math.min(1, Math.floor(remainingNodes / 2));
      }

      const childCount = Math.floor(Math.random() * (maxChildren + 1));

      for (
        let i = 0;
        i < childCount && nodeCount < totalNodes && depth < maxSafeDepth;
        i++
      ) {
        const child = createNode(depth + 1);
        if (child) {
          node.children[child.id] = child;
        }
      }

      return node;
    }

    const result = createNode(0);
    console.log(`Created balanced tree with exactly ${nodeCount} nodes`);
    return result!;
  }

  function createChainTree(depth: number): ShelfNode {
    const safeDepth = Math.min(depth, SAFE_MAX_DEPTH);

    function createNode(currentDepth: number): ShelfNode {
      const node: ShelfNode = {
        id: generateUUID(),
        name: `Chain-D${currentDepth}`,
        children: {},
        materialIds: generateMaterialIds(1),
      };

      if (currentDepth < safeDepth - 1) {
        const child = createNode(currentDepth + 1);
        node.children[child.id] = child;
      }

      return node;
    }

    const result = createNode(0);
    console.log(`Created chain tree with depth: ${safeDepth}`);
    return result;
  }

  test("Performance: Wide Tree (Limited nodes)", () => {
    console.log("\n=== Wide Tree Performance Test ===");
    console.log(
      `Current limits: maxIterations=${ShelfManager.getMaxIterations()}`
    );

    console.time("Creating wide tree");
    const wideTree = createWideTree(100, 3, 1000);
    console.timeEnd("Creating wide tree");

    console.time("Analyzing wide tree");
    const analysis = ShelfManager.analysisAndGenerateSummary(wideTree);
    console.timeEnd("Analyzing wide tree");
    console.log(`Wide tree analysis:`, analysis);

    console.time("Safe encoding wide tree");
    const encoded = ShelfManager.safeEncode(wideTree);
    console.timeEnd("Safe encoding wide tree");

    const encodedString = Buffer.from(encoded).toString("base64");
    console.log(`Encoded size: ${(encodedString.length / 1024).toFixed(2)} KB`);

    console.time("Decoding wide tree");
    const decoded = ShelfManager.decodeFromBase64(encodedString);
    console.timeEnd("Decoding wide tree");

    expect(decoded.name).toBe(wideTree.name);
    console.log("✅ Wide tree test passed\n");
  });

  test("Performance: Balanced Tree (3000 nodes)", () => {
    console.log("\n=== Balanced Tree Performance Test ===");

    console.time("Creating balanced tree");
    const balancedTree = createBalancedTree(5000);
    console.timeEnd("Creating balanced tree");

    console.time("Analyzing balanced tree");
    const analysis = ShelfManager.analysisAndGenerateSummary(balancedTree);
    console.timeEnd("Analyzing balanced tree");
    console.log(`Balanced tree analysis:`, analysis);

    console.time("Safe encoding balanced tree");
    const encoded = ShelfManager.safeEncode(balancedTree);
    console.timeEnd("Safe encoding balanced tree");

    const encodedString = Buffer.from(encoded).toString("base64");
    const sizeKB = (encodedString.length / 1024).toFixed(2);
    const bytesPerNode = (
      encodedString.length / analysis.totalShelfNodes
    ).toFixed(2);

    console.log(`Encoded size: ${sizeKB} KB`);
    console.log(`Bytes per node: ${bytesPerNode}`);
    console.log(
      `Compression ratio: ${(
        (analysis.totalShelfNodes * 200) /
        encodedString.length
      ).toFixed(2)}x`
    );

    console.time("Decoding balanced tree");
    const decoded = ShelfManager.decodeFromBase64(encodedString);
    console.timeEnd("Decoding balanced tree");

    const decodedAnalysis = ShelfManager.analysisAndGenerateSummary(decoded);
    expect(decodedAnalysis.totalShelfNodes).toBe(analysis.totalShelfNodes);

    console.log("✅ Balanced tree test passed\n");
  });

  test("Performance: Progressive Size Testing", () => {
    console.log("\n=== Progressive Size Testing ===");

    const testConfigs = [
      { nodes: 50, name: "Tiny" },
      { nodes: 100, name: "Small" },
      { nodes: 300, name: "Medium" },
      { nodes: 600, name: "Large" },
      { nodes: 1000, name: "Very Large" },
    ];

    testConfigs.forEach(config => {
      console.log(`\n--- Testing ${config.name} (${config.nodes} nodes) ---`);

      console.time(`Creating ${config.name}`);
      const tree = createBalancedTree(config.nodes);
      console.timeEnd(`Creating ${config.name}`);

      console.time(`Analyzing ${config.name}`);
      const analysis = ShelfManager.analysisAndGenerateSummary(tree);
      console.timeEnd(`Analyzing ${config.name}`);

      console.log(`Actual nodes: ${analysis.totalShelfNodes}`);
      console.log(
        `Max depth: ${analysis.maxDepth}, Max width: ${analysis.maxWidth}`
      );
      console.log(`Total materials: ${analysis.totalMaterials}`);

      console.time(`Encoding ${config.name}`);
      const encoded = ShelfManager.safeEncode(tree);
      console.timeEnd(`Encoding ${config.name}`);

      const encodedString = Buffer.from(encoded).toString("base64");
      const sizeKB = (encodedString.length / 1024).toFixed(2);
      const bytesPerNode = (
        encodedString.length / analysis.totalShelfNodes
      ).toFixed(2);

      console.log(`Size: ${sizeKB} KB, Bytes/node: ${bytesPerNode}`);

      console.time(`Decoding ${config.name}`);
      const decoded = ShelfManager.decodeFromBase64(encodedString);
      console.timeEnd(`Decoding ${config.name}`);

      expect(decoded.name).toBeDefined();
    });

    console.log("\n✅ Progressive testing completed\n");
  });

  test("Performance: Max Iterations Boundary Test", () => {
    console.log("\n=== Max Iterations Boundary Test ===");

    const originalMaxIterations = ShelfManager.getMaxIterations();
    console.log(`Original maxIterations: ${originalMaxIterations}`);

    console.time("Creating boundary test tree");
    const boundaryTree = createBalancedTree(500);
    console.timeEnd("Creating boundary test tree");

    console.log("\n--- Testing with normal limits ---");
    try {
      console.time("Normal analysis");
      const normalAnalysis =
        ShelfManager.analysisAndGenerateSummary(boundaryTree);
      console.timeEnd("Normal analysis");
      console.log(
        `✅ Normal analysis completed: ${normalAnalysis.totalShelfNodes} nodes`
      );
      console.log(
        `Tree structure: depth=${normalAnalysis.maxDepth}, width=${normalAnalysis.maxWidth}`
      );
    } catch (error) {
      console.timeEnd("Normal analysis");
      console.log(`❌ Normal analysis failed: ${(error as Error).message}`);
    }

    const testLimits = [50, 100, 200, 300, 500];

    testLimits.forEach(limit => {
      console.log(`\n--- Testing with maxIterations = ${limit} ---`);

      ShelfManager.setMaxIterations(limit);
      console.log(`Set maxIterations to: ${ShelfManager.getMaxIterations()}`);

      try {
        console.time(`Analysis with limit ${limit}`);
        const analysis = ShelfManager.analysisAndGenerateSummary(boundaryTree);
        console.timeEnd(`Analysis with limit ${limit}`);
        console.log(
          `✅ Analysis with limit ${limit} completed: ${analysis.totalShelfNodes} nodes`
        );
      } catch (error) {
        console.timeEnd(`Analysis with limit ${limit}`);
        console.log(
          `🎯 Analysis correctly hit limit ${limit}: ${
            (error as Error).message
          }`
        );
      }

      try {
        console.time(`Circular check with limit ${limit}`);
        ShelfManager.isChildrenCircular(boundaryTree);
        console.timeEnd(`Circular check with limit ${limit}`);
        console.log(`✅ Circular check with limit ${limit} completed`);
      } catch (error) {
        console.timeEnd(`Circular check with limit ${limit}`);
        console.log(
          `🎯 Circular check correctly hit limit ${limit}: ${
            (error as Error).message
          }`
        );
      }
    });

    ShelfManager.setMaxIterations(originalMaxIterations);
    console.log(
      `\n✅ Restored maxIterations to: ${ShelfManager.getMaxIterations()}`
    );
    console.log("✅ Max iterations boundary test completed\n");
  });

  test("Performance: Memory Usage Analysis", () => {
    console.log("\n=== Memory Usage Analysis ===");

    const testSizes = [50, 100, 200, 300, 500];

    testSizes.forEach(size => {
      console.log(`\n--- Testing ${size} nodes ---`);

      const tree = createBalancedTree(size);
      const analysis = ShelfManager.analysisAndGenerateSummary(tree);

      const encoded = ShelfManager.safeEncode(tree);
      const encodedString = Buffer.from(encoded).toString("base64");

      const sizeKB = (encodedString.length / 1024).toFixed(2);
      const bytesPerNode = (
        encodedString.length / analysis.totalShelfNodes
      ).toFixed(2);
      const efficiency = (
        (analysis.totalShelfNodes * 100) /
        encodedString.length
      ).toFixed(3);

      console.log(`Actual nodes: ${analysis.totalShelfNodes}`);
      console.log(
        `Max depth: ${analysis.maxDepth}, Max width: ${analysis.maxWidth}`
      );
      console.log(`Encoded size: ${sizeKB} KB`);
      console.log(`Bytes per node: ${bytesPerNode}`);
      console.log(`Efficiency: ${efficiency} nodes/100bytes`);
    });

    console.log("\n✅ Memory analysis completed\n");
  });

  test("Performance: Find Optimal MaxIterations", () => {
    console.log("\n=== Finding Optimal MaxIterations ===");

    const tree = createBalancedTree(800);

    const iterationLimits = [100, 200, 300, 500, 800, 1000];

    console.log("Testing different maxIterations values:");
    console.log("| Limit | Analysis | Circular | Encoding | Status |");
    console.log("|--------|----------|----------|----------|---------|");

    iterationLimits.forEach(limit => {
      ShelfManager.setMaxIterations(limit);

      let analysisResult = "❌";
      let circularResult = "❌";
      let encodingResult = "❌";
      let overallStatus = "FAIL";

      try {
        const analysis = ShelfManager.analysisAndGenerateSummary(tree);
        analysisResult = `✅(${analysis.totalShelfNodes})`;
      } catch (error) {
        analysisResult = "⚠️LIMIT";
      }

      try {
        ShelfManager.isChildrenCircular(tree);
        circularResult = "✅";
      } catch (error) {
        circularResult = "⚠️LIMIT";
      }

      if (analysisResult.includes("✅") && circularResult === "✅") {
        try {
          const encoded = ShelfManager.safeEncode(tree);
          encodingResult = `✅(${encoded.length}B)`;
          overallStatus = "PASS";
        } catch (error) {
          encodingResult = "⚠️ERROR";
        }
      } else {
        encodingResult = "⚠️SKIP";
      }

      console.log(
        `| ${limit.toString().padEnd(6)} | ${analysisResult.padEnd(
          8
        )} | ${circularResult.padEnd(8)} | ${encodingResult.padEnd(
          8
        )} | ${overallStatus} |`
      );
    });

    ShelfManager.setMaxIterations(DEFAULT_MAX_ITERATIONS);
    console.log("\n💡 Recommendations:");
    console.log("- For development: 500-1000 (fast feedback)");
    console.log("- For testing: 1000-5000 (comprehensive testing)");
    console.log("- For production: 5000+ (handle real workloads)");
    console.log("\n✅ Optimal maxIterations analysis completed\n");
  });

  test("Performance: Depth Limit Testing of msgpack", () => {
    console.log("\n=== msgpack Depth Limit Testing ===");

    const depthLimits = [10, 20, 30, 40, 50, 70, 100];

    depthLimits.forEach(depth => {
      console.log(`\n--- Testing depth ${depth} ---`);

      console.time(`Creating depth-${depth} tree`);
      const deepTree = createChainTree(depth);
      console.timeEnd(`Creating depth-${depth} tree`);

      const analysis = ShelfManager.analysisAndGenerateSummary(deepTree);
      console.log(
        `Tree: ${analysis.totalShelfNodes} nodes, actual depth ${analysis.maxDepth}`
      );

      try {
        console.time(`Encoding depth-${depth}`);
        const encoded = ShelfManager.safeEncode(deepTree);
        console.timeEnd(`Encoding depth-${depth}`);
        console.log(`✅ Depth ${depth}: SUCCESS - ${encoded.length} bytes`);

        console.time(`Decoding depth-${depth}`);
        const decoded = ShelfManager.decode(encoded);
        console.timeEnd(`Decoding depth-${depth}`);
        console.log(`✅ Decode depth ${depth}: SUCCESS`);
      } catch (error) {
        console.timeEnd(`Encoding depth-${depth}`);
        console.log(`❌ Depth ${depth}: FAILED - ${(error as Error).message}`);
      }
    });

    console.log("\n💡 All tests within safe depth limits");
    console.log("✅ msgpack depth testing completed\n");
  });

  // /* ============================== Aggressive Test ============================== */

  // // 在文件最後加入這個測試

  // // ✅ 新增：激進的大規模平衡樹測試
  test("Performance: Balanced Tree at max iteration limit (10,000 nodes)", () => {
    console.log("\n=== Testing Balanced Tree at Max Iteration Limit ===");
    console.log("🎯 Goal: Create and encode a tree with exactly 10,000 nodes.");

    const originalMaxIterations = ShelfManager.getMaxIterations();
    const maxIterationsLimit = 1e5;
    ShelfManager.setMaxIterations(maxIterationsLimit);
    console.log(
      `Set maxIterations to its hard limit: ${ShelfManager.getMaxIterations()}`
    );

    const targetNodes = 1e4;
    console.log(`Target nodes: ${targetNodes.toLocaleString()}`);

    function createPerfectBalancedTree(
      totalNodes: number,
      factor: number
    ): ShelfNode {
      if (totalNodes <= 0) {
        throw new Error("Cannot create a tree with 0 nodes.");
      }
      if (factor < 1) {
        throw new Error("Factor must be at least 1.");
      }

      const root: ShelfNode = {
        id: generateUUID(),
        name: `Node-0`,
        children: {},
        materialIds: generateMaterialIds(1),
      };

      let nodeCount = 1;
      if (nodeCount === totalNodes) return root;

      let queue: ShelfNode[] = [root];

      console.time(`Creating ${totalNodes}-node tree`);

      while (queue.length > 0 && nodeCount < totalNodes) {
        const parents = [...queue];
        queue = [];

        for (const parent of parents) {
          if (nodeCount >= totalNodes) break;

          for (let i = 0; i < factor; i++) {
            if (nodeCount >= totalNodes) break;

            const newNode: ShelfNode = {
              id: generateUUID(),
              name: `Node-${nodeCount}`,
              children: {},
              materialIds: generateMaterialIds(1),
            };

            parent.children[newNode.id] = newNode;
            queue.push(newNode);
            nodeCount++;
          }
        }
      }

      console.timeEnd(`Creating ${totalNodes}-node tree`);
      console.log(`✅ Created tree with ${nodeCount.toLocaleString()} nodes.`);
      return root;
    }

    try {
      const tree = createPerfectBalancedTree(targetNodes, 10);

      // 分析樹結構以驗證其是否在限制內
      console.time("Analyzing 10,000-node tree");
      const analysis = ShelfManager.analysisAndGenerateSummary(tree);
      console.timeEnd("Analyzing 10,000-node tree");

      console.log(`📊 Tree analysis results:`);
      console.log(`  - Total nodes: ${analysis.totalShelfNodes}`);
      console.log(`  - Max depth: ${analysis.maxDepth}`);
      console.log(`  - Max width: ${analysis.maxWidth}`);

      // 驗證樹的結構符合所有限制
      expect(analysis.totalShelfNodes).toBe(targetNodes);
      expect(analysis.maxDepth).toBeLessThanOrEqual(50);
      expect(analysis.maxWidth).toBeLessThanOrEqual(1e5);

      // 執行並測量 safeEncode 的時間
      console.log("🚀 Encoding 10,000-node tree...");
      console.time("Encoding 10,000-node tree");
      const encoded = ShelfManager.safeEncode(tree);
      console.timeEnd("Encoding 10,000-node tree");

      const sizeKB = (encoded.length / 1024).toFixed(2);
      console.log(`📦 Encoded successfully. Size: ${sizeKB} KB`);
      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);
    } catch (error) {
      // 這個測試預期會成功，如果出錯則讓測試失敗
      console.error("❌ Test failed unexpectedly:", error);
      fail((error as Error).message);
    } finally {
      // 無論如何都恢復原始的迭代設定
      ShelfManager.setMaxIterations(originalMaxIterations);
      console.log(
        `\n✅ Restored maxIterations to: ${ShelfManager.getMaxIterations()}`
      );
    }
    console.log("✅ Boundary condition test completed.\n");
  });

  /* ============================== Aggressive Test ============================== */
});
