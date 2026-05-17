"use client";

import { useState } from "react";
import type { ProcessingReportDto } from "../actions/upload.types";
import type { PublicBatchDto } from "../data";
import { UploadPanel } from "./upload-panel";
import { ValidationBanner } from "./validation-banner";

export function UploadFlow({ batch }: { batch: PublicBatchDto }) {
  const [validationReport, setValidationReport] =
    useState<ProcessingReportDto | null>(null);

  return (
    <>
      <UploadPanel
        batch={batch}
        onValidated={setValidationReport}
        validationReport={validationReport}
      />
      <ValidationBanner
        batch={batch}
        validationReport={validationReport ?? undefined}
      />
    </>
  );
}
