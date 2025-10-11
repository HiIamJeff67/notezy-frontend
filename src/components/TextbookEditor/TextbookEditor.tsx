"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useLanguage, useLoading } from "@/hooks";
import { Download, Save, Upload } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// 設定 pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface TextbookEditorProps {
  materialId: string;
  initialPdfUrl?: string;
}

interface Annotation {
  id: string;
  type: "highlight" | "text" | "drawing";
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  text?: string;
  points?: { x: number; y: number }[];
}

const TextbookEditor = ({ materialId, initialPdfUrl }: TextbookEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarManager = useSidebar();
  const loadingManager = useLoading();
  const languageManager = useLanguage();

  const [pdfDocument, setPdfDocument] =
    useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<
    "highlight" | "text" | "drawing" | null
  >(null);
  const [scale, setScale] = useState(1.5);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  useEffect(() => {
    if (initialPdfUrl) {
      loadPDF(initialPdfUrl);
    }
  }, [initialPdfUrl]);

  useEffect(() => {
    if (pdfDocument) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDocument, scale, annotations]);

  // 載入 PDF
  const loadPDF = async (url: string) => {
    loadingManager.startAsyncTransactionLoading(async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);

        // 獲取原始 PDF bytes 用於後續編輯
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        setPdfBytes(new Uint8Array(arrayBuffer));

        toast.success("PDF 載入成功");
      } catch (error) {
        console.error("載入 PDF 失敗:", error);
        toast.error("載入 PDF 失敗");
      }
    });
  };

  // 渲染當前頁面
  const renderPage = async (pageNum: number) => {
    if (!pdfDocument || !canvasRef.current) return;

    try {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        canvas: canvas,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // 渲染該頁的註記
      renderAnnotations(pageNum);
    } catch (error) {
      console.error("渲染頁面失敗:", error);
    }
  };

  // 渲染註記
  const renderAnnotations = (pageNum: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const pageAnnotations = annotations.filter(a => a.page === pageNum);

    pageAnnotations.forEach(annotation => {
      context.save();

      switch (annotation.type) {
        case "highlight":
          context.fillStyle = annotation.color || "rgba(255, 255, 0, 0.3)";
          context.fillRect(
            annotation.x,
            annotation.y,
            annotation.width || 100,
            annotation.height || 20
          );
          break;

        case "text":
          context.fillStyle = annotation.color || "#000000";
          context.font = "16px Arial";
          context.fillText(annotation.text || "", annotation.x, annotation.y);
          break;

        case "drawing":
          if (annotation.points && annotation.points.length > 1) {
            context.strokeStyle = annotation.color || "#FF0000";
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(annotation.points[0].x, annotation.points[0].y);
            annotation.points.forEach(point => {
              context.lineTo(point.x, point.y);
            });
            context.stroke();
          }
          break;
      }

      context.restore();
    });
  };

  // 處理 canvas 點擊/繪製
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentTool || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      type: currentTool,
      page: currentPage,
      x,
      y,
      color: currentTool === "highlight" ? "rgba(255, 255, 0, 0.3)" : "#FF0000",
    };

    if (currentTool === "highlight") {
      newAnnotation.width = 100;
      newAnnotation.height = 20;
    } else if (currentTool === "text") {
      const text = prompt("輸入文字:");
      if (text) {
        newAnnotation.text = text;
      } else {
        return;
      }
    }

    setAnnotations(prev => [...prev, newAnnotation]);
    renderPage(currentPage);
  };

  // 儲存註記為 JSON
  const handleSaveAnnotations = async () => {
    try {
      const annotationsJSON = JSON.stringify(annotations, null, 2);
      const blob = new Blob([annotationsJSON], { type: "application/json" });

      // 這裡應該呼叫你的 API 上傳到後端
      // await saveAnnotationsToBackend(materialId, blob);

      toast.success("註記已儲存");
    } catch (error) {
      console.error("儲存註記失敗:", error);
      toast.error("儲存註記失敗");
    }
  };

  // 匯出含註記的 PDF
  const handleExportPDF = async () => {
    if (!pdfBytes) {
      toast.error("沒有 PDF 可供匯出");
      return;
    }

    loadingManager.startAsyncTransactionLoading(async () => {
      try {
        // 使用 pdf-lib 載入原始 PDF
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        // 將註記燒入 PDF
        for (const annotation of annotations) {
          const page = pages[annotation.page - 1];
          if (!page) continue;

          const { height } = page.getSize();

          switch (annotation.type) {
            case "highlight":
              page.drawRectangle({
                x: annotation.x,
                y: height - annotation.y - (annotation.height || 20),
                width: annotation.width || 100,
                height: annotation.height || 20,
                opacity: 0.3,
              });
              break;

            case "text":
              page.drawText(annotation.text || "", {
                x: annotation.x,
                y: height - annotation.y,
                size: 16,
              });
              break;

            // drawing 需要更複雜的處理，這裡簡化
          }
        }

        // 產生新 PDF
        const pdfBytesWithAnnotations = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytesWithAnnotations)], {
          type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `textbook-${materialId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success("PDF 已匯出");
      } catch (error) {
        console.error("匯出 PDF 失敗:", error);
        toast.error("匯出 PDF 失敗");
      }
    });
  };

  // 上傳 PDF
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    loadPDF(url);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <header className="w-full h-12 flex shrink-0 items-center gap-2 border-b px-4 glass-header">
        {sidebarManager.isMobile && <SidebarTrigger />}
        <h1 className="font-semibold">Textbook Editor</h1>

        {/* 工具列 */}
        <div className="ml-auto flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="上傳 PDF"
          >
            <Upload className="h-4 w-4" />
          </Button>

          <Button
            variant={currentTool === "highlight" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setCurrentTool(currentTool === "highlight" ? null : "highlight")
            }
          >
            螢光筆
          </Button>

          <Button
            variant={currentTool === "text" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setCurrentTool(currentTool === "text" ? null : "text")
            }
          >
            文字
          </Button>

          <Button
            variant={currentTool === "drawing" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setCurrentTool(currentTool === "drawing" ? null : "drawing")
            }
          >
            手寫
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleSaveAnnotations}
            title="儲存註記"
          >
            <Save className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleExportPDF}
            title="匯出 PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* PDF 顯示區 */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full cursor-crosshair"
          />
        </div>

        {/* 頁面控制 */}
        {pdfDocument && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              上一頁
            </Button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              下一頁
            </Button>

            <select
              value={scale}
              onChange={e => setScale(Number(e.target.value))}
              className="ml-4 border rounded px-2 py-1"
            >
              <option value={0.5}>50%</option>
              <option value={1}>100%</option>
              <option value={1.5}>150%</option>
              <option value={2}>200%</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextbookEditor;
