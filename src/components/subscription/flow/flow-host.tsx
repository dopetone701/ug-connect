"use client";
import { useState } from "react";
import { useSubscriptionFlow } from "@/stores/use-subscription-flow";
import MethodSheet from "./method-sheet";
import PaymentSheet from "./payment-sheet";
import ProcessingSheet from "./processing-sheet";
import SuccessSheet from "./success-sheet";
import FailedSheet from "./failed-sheet";
import CancilModal from "./cancil-modal";

export default function SubscriptionFlowHost() {
  const { step, closeAll } = useSubscriptionFlow();
  const [showCancil, setShowCancil] = useState(false);

  const handleRequestClose = () => {
    if (step === "processing") return;
    setShowCancil(true);
  };

  const handleKeep = () => setShowCancil(false);
  const handleConfirmCancil = () => {
    setShowCancil(false);
    closeAll();
  };

  return (
    <>
      {step === "method" && <MethodSheet onClose={handleRequestClose} />}
      {step === "payment" && <PaymentSheet onClose={handleRequestClose} />}
      {step === "processing" && <ProcessingSheet />}
      {step === "success" && <SuccessSheet />}
      {step === "failed" && <FailedSheet onClose={handleRequestClose} />}
      {showCancil && <CancilModal onKeep={handleKeep} onConfirm={handleConfirmCancil} />}
    </>
  );
}

