import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { useAppSelector } from "@/app/redux/hook";
import Image from "next/image";
import InputRadio from "@/app/components/form/InputRadio";
import {Options} from "@/types";
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface SignatureSectionProps {
  title: string;
  signature: string;
  onSignatureChange: (signature: string) => void;
  showPresetSignature?: boolean;
  showResetButton?: boolean;
  isReadOnly?: boolean;
  signatureType?: string;
  onSignatureTypeChange?: (type: string) => void;
  presetSignatureUrl?: string;
  uniqueId?: string;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({
  title,
  signature,
  onSignatureChange,
  showPresetSignature = true,
  showResetButton = true,
  isReadOnly = false,
  signatureType = "preset",
  onSignatureTypeChange,
  presetSignatureUrl = "",
  uniqueId = "signature"
}) => {
  const [showSignature, setShowSignature] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenSize = useAppSelector(state => state.screen_size);
  const signatureTypeOptions: Options[] = [
    { value: `${uniqueId}-preset`, label: 'ใช้ลายเซ็นที่ตั้งไว้'},
    { value: `${uniqueId}-new`, label: 'เซ็นใหม่'}
  ]

  // Initialize canvas
  useEffect(() => {
    if (showSignature && canvasRef.current && !isReadOnly) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';// สีเส้น
        ctx.lineWidth = 2; // ความหนาเส้น
        ctx.lineCap = 'round'; // ปลายเส้นโค้ง
        ctx.lineJoin = 'round'; // มุมเส้นโค้ง
      }
    }
  }, [showSignature, isReadOnly]);

  const handleChangeSignType = (sel: string) => {
    const actualType = sel.replace(`${uniqueId}-`, '');
    onSignatureTypeChange?.(actualType)
    if(actualType === 'preset') {
      handleUsePresetSignature()
    }else {
      handleSignatureClick()
    }
  }

  const handleSignatureClick = () => {
    if (!isReadOnly) {
      setShowSignature(true);
    }
  };

  const handleSignatureComplete = () => {
    if (isReadOnly) return;

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL();
      onSignatureChange(dataURL);
      onSignatureTypeChange?.("new")
    }
    setShowSignature(false);
  };

  const handleResetSignature = () => {
    if (!isReadOnly) {
      onSignatureChange('');
    }
  };

  const handleUsePresetSignature = () => {
    if (!isReadOnly && presetSignatureUrl) {
      onSignatureChange('');
    }
  };

  const clearCanvas = () => {
    if (isReadOnly) return;

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || isReadOnly) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    if (ctx) {
      //คำนวณตำแหน่งเมาส์ที่แท้จริงบน canvas
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineTo(x, y); //วาดเส้นจากจุดปัจจุบันไปยังตำแหน่งใหม่
      ctx.stroke(); //แสดงเส้นที่วาด

      // เริ่มเส้นใหม่จากตำแหน่งปัจจุบัน
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopDrawing = () => {
    if (isReadOnly) return;
    if (!canvasRef.current) return;
    setIsDrawing(false);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath(); // รีเซ็ต path เพื่อไม่ให้เส้นต่อเนื่อง
    }
  };

  //แปลง Touch Event เป็น Mouse Event:
  const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    setIsDrawing(true);
    const touch = e.touches[0];
    const syntheticMouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as React.MouseEvent<HTMLCanvasElement>;
    draw(syntheticMouseEvent);
  };

  const touchDraw = (e: React.TouchEvent<HTMLCanvasElement>) => {
    //ทำงานเมื่อลากนิ้ว เพื่อ draw เส้น
    if (isReadOnly) return;
    if (!isDrawing) return;
    const touch = e.touches[0];
    const syntheticMouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as React.MouseEvent<HTMLCanvasElement>;
    draw(syntheticMouseEvent);
  };

  const stopTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    //ทำงานเมื่อหยุดเซ็น หรือยกนิ้วออก และหยุด draw
    if (isReadOnly) return;
    stopDrawing();
  };

  const isMobile = screenSize === MOBILE_SCREEN || window.innerWidth < 768;

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col space-y-4 w-full">
        {/* Title */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">
            {title}
          </Label>
        </div>

        {/* Mobile preset signature buttons */}
        {showPresetSignature && !isReadOnly && presetSignatureUrl && (
          <div className="space-y-3">
            <InputRadio options={signatureTypeOptions}
                        value={`${uniqueId}-${signatureType}`}
                        setData={handleChangeSignType}
                        className="flex flex-wrap"
                        classItem="flex-1 flex justify-center font-bold items-center w-full border-1 border-[#671FAB] px-2 py-4 rounded-xl"
            />
          </div>
        )}

        {/* Signature canvas/display */}
        <div className="relative">
          <div
            className="border-2 border-dashed border-gray-300 rounded-2xl min-h-[200px] w-full bg-gray-50 cursor-pointer relative p-6"
            onClick={!signature && !isReadOnly ? handleSignatureClick : undefined}
          >
            {signature || presetSignatureUrl ? (
              <>
                {/* Signature display */}
                <div className="w-full h-full min-h-[180px] flex items-center justify-center">
                  {(signatureType === 'new' && signature) || (signatureType === "preset" && presetSignatureUrl) ? (
                    <Image
                      src={signatureType ===  "preset" ? presetSignatureUrl : signature}
                      alt="Signature"
                      width={300}
                      height={180}
                      className="max-w-full max-h-full object-contain"
                      unoptimized // เพื่อให้สามารถใช้ data URLs ได้
                    />
                  ) : (
                    <div className="text-center flex items-center justify-center h-full">
                      <div>
                        <div className="text-2xl font-signature text-gray-700 mb-2">✓</div>
                        <p className="text-sm text-gray-500">ลายเซ็นอิเล็กทรอนิกส์</p>
                      </div>
                    </div>
                  )}
                </div>


                {showResetButton && !isReadOnly && (
                  <button
                    onClick={handleResetSignature}
                    className="absolute bottom-4 right-4 text-purple-600 underline text-sm bg-white px-3 py-1 rounded-md shadow-sm hover:bg-gray-50 z-10"
                  >
                    รีเซ็ต
                  </button>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 flex items-center justify-center min-h-[180px]">
                <div>
                  <FontAwesomeIcon icon={faPen} className="text-2xl mb-3" />
                  <p className="text-sm">แตะเพื่อเซ็นชื่อ</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Signature Modal for mobile */}
        {showSignature && !isReadOnly && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ scrollBehavior: 'auto' }}>
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4 text-center">ลายเซ็นอิเล็กทรอนิกส์</h3>
                <div className="border-2 border-gray-200 rounded-xl mb-4 bg-gray-50 relative">
                  <canvas
                    ref={canvasRef}
                    width="350"
                    height="200"
                    className="w-full h-48 !touch-none rounded-xl"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startTouchDrawing}
                    onTouchMove={touchDraw}
                    onTouchEnd={stopTouchDrawing}
                    style={{ touchAction: 'none' }}
                  />
                  <button
                    onClick={clearCanvas}
                    className="absolute top-3 right-3 bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-200"
                  >
                    ลบ
                  </button>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSignature(false)}
                    className="flex-1 rounded-xl border-gray-300"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleSignatureComplete}
                    className="bg-[#671FAB] hover:bg-[#5A1A96] flex-1 rounded-xl"
                  >
                    ยืนยันลายเซ็น
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex flex-col items-center space-y-3 border-2 p-4 rounded-lg w-full h-full">
      <div className="flex items-center justify-between mb-3 w-full">
        <Label className="w-full bg-[#671FAB] text-white px-4 py-2 rounded-md text-sm text-center justify-center">
          {title}
        </Label>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg h-full w-full flex items-center justify-center bg-gray-50 relative cursor-pointer"
        onClick={!signature && !isReadOnly ? handleSignatureClick : undefined}
      >
        {signature ? (
          <div className="relative w-full h-full">
            {signature ? (
              <Image
                src={signature}
                alt="Signature"
                fill
                className="object-contain"
                unoptimized
              />
            ) : (
              <div className="text-center flex items-center justify-center h-full">
                <div>
                  <div className="text-2xl font-signature text-gray-700 mb-2">✓</div>
                  <p className="text-xs text-gray-500">ลายเซ็นอิเล็กทรอนิกส์</p>
                </div>
              </div>
            )}
            {showResetButton && !isReadOnly && (
              <button
                onClick={handleResetSignature}
                className="absolute bottom-2 right-2 text-purple-600 underline text-sm bg-white px-2 py-1 rounded shadow-sm hover:bg-gray-50"
              >
                รีเซ็ต
              </button>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <FontAwesomeIcon icon={faPen} className="text-2xl mb-2" />
            <p className="text-sm">คลิกเพื่อเซ็นชื่อ</p>
          </div>
        )}
      </div>

      {showSignature && !isReadOnly && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border">
            <h3 className="text-lg font-medium mb-4">ลายเซ็นอิเล็กทรอนิกส์</h3>
            <div className="border rounded-lg mb-4 bg-gray-50 relative">
              <canvas
                ref={canvasRef}
                width="400"
                height="200"
                className="w-full h-40 touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startTouchDrawing}
                onTouchMove={touchDraw}
                onTouchEnd={stopTouchDrawing}
                style={{ touchAction: 'none' }}
              />
              <button
                onClick={clearCanvas}
                className="absolute top-2 right-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs"
              >
                ลบ
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSignature(false)}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSignatureComplete}
                className="bg-[#671FAB] hover:bg-[#5A1A96]"
              >
                ยืนยันลายเซ็น
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureSection;
