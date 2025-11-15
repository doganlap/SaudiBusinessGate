"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  XCircle,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

interface WorkflowStep {
  id: string;
  stepName: string;
  stepNameAr: string;
  status: "pending" | "running" | "completed" | "failed" | "paused";
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  details?: string;
  detailsAr?: string;
  agentName?: string;
  progress?: number;
}

interface WorkflowInstance {
  id: string;
  workflowName: string;
  workflowNameAr: string;
  status: "queued" | "running" | "completed" | "failed" | "paused";
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

interface RealTimeWorkflowTimelineProps {
  locale: "ar" | "en";
  tenantId: string;
  workflowId?: string;
}

export default function RealTimeWorkflowTimeline({
  locale,
  tenantId,
  workflowId,
}: RealTimeWorkflowTimelineProps) {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const t = {
    ar: {
      title: "سير العمل المباشر",
      noWorkflows: "لا توجد عمليات جارية",
      status: {
        queued: "في الانتظار",
        running: "قيد التنفيذ",
        completed: "مكتمل",
        failed: "فشل",
        paused: "متوقف مؤقتاً",
        pending: "معلق",
      },
      connected: "متصل",
      disconnected: "غير متصل",
      reconnecting: "إعادة الاتصال...",
    },
    en: {
      title: "Live Workflow",
      noWorkflows: "No active workflows",
      status: {
        queued: "Queued",
        running: "Running",
        completed: "Completed",
        failed: "Failed",
        paused: "Paused",
        pending: "Pending",
      },
      connected: "Connected",
      disconnected: "Disconnected",
      reconnecting: "Reconnecting...",
    },
  }[locale];

  // Initialize WebSocket connection
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3050", {
      query: { tenantId, workflowId },
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
      setConnected(false);
    });

    // Listen for workflow updates
    socketInstance.on("workflow:update", (data: WorkflowInstance) => {
      console.log("📊 Workflow update:", data);
      setWorkflows((prev) => {
        const index = prev.findIndex((w) => w.id === data.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }
        return [data, ...prev];
      });
    });

    // Listen for step updates
    socketInstance.on("workflow:step:update", (data: {
      workflowId: string;
      step: WorkflowStep;
    }) => {
      console.log("🔄 Step update:", data);
      setWorkflows((prev) =>
        prev.map((workflow) => {
          if (workflow.id === data.workflowId) {
            return {
              ...workflow,
              steps: workflow.steps.map((step) =>
                step.id === data.step.id ? data.step : step
              ),
            };
          }
          return workflow;
        })
      );
    });

    // Listen for new workflows
    socketInstance.on("workflow:created", (data: WorkflowInstance) => {
      console.log("🆕 New workflow:", data);
      setWorkflows((prev) => [data, ...prev]);
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      socketInstance.disconnect();
    };
  }, [tenantId, workflowId]);

  // Fetch initial workflows
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch(
          `/api/workflows/instances?tenantId=${tenantId}${
            workflowId ? `&workflowId=${workflowId}` : ""
          }`
        );
        if (response.ok) {
          const data = await response.json();
          setWorkflows(data.workflows || []);
        }
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
      }
    };

    fetchWorkflows();
  }, [tenantId, workflowId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-amber-500" />;
      case "queued":
      case "pending":
        return <Clock className="h-4 w-4 text-neutral-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "from-emerald-400/70 to-teal-400/70";
      case "running":
        return "from-blue-400/70 to-cyan-400/70";
      case "failed":
        return "from-rose-400/70 to-red-400/70";
      case "paused":
        return "from-amber-400/70 to-orange-400/70";
      default:
        return "from-neutral-400/70 to-neutral-500/70";
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "--:--";
    const date = new Date(timestamp);
    return date.toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}${locale === "ar" ? "د" : "m"} ${seconds % 60}${
        locale === "ar" ? "ث" : "s"
      }`;
    }
    return `${seconds}${locale === "ar" ? "ث" : "s"}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{t.title}</h3>
          <motion.div
            animate={{ scale: connected ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </motion.div>
        </div>
        <span className="text-xs text-neutral-500">
          {connected ? t.connected : t.disconnected}
        </span>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-3">
        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
            <Clock className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">{t.noWorkflows}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {workflows.map((workflow) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mb-4"
              >
                {/* Workflow Header */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(workflow.status)}
                    <span className="text-sm font-medium">
                      {locale === "ar"
                        ? workflow.workflowNameAr
                        : workflow.workflowName}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {formatTime(workflow.createdAt)}
                  </span>
                </div>

                {/* Steps Timeline */}
                <ol className="relative border-s border-white/15 ps-4">
                  {workflow.steps.map((step, index) => (
                    <motion.li
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="mb-3 ms-2"
                    >
                      <span
                        className={`absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-gradient-to-r ${getStatusColor(
                          step.status
                        )} ring-2 ring-white/40`}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <div className="text-sm font-medium">
                            {locale === "ar" ? step.stepNameAr : step.stepName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          {step.duration && (
                            <span>{formatDuration(step.duration)}</span>
                          )}
                          {step.completedAt && (
                            <span>{formatTime(step.completedAt)}</span>
                          )}
                        </div>
                      </div>
                      {step.details && (
                        <div className="mt-1 text-xs text-neutral-500">
                          {locale === "ar" ? step.detailsAr : step.details}
                        </div>
                      )}
                      {step.progress !== undefined && step.status === "running" && (
                        <div className="mt-2">
                          <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${step.progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <div className="mt-1 text-xs text-neutral-500 text-right">
                            {step.progress}%
                          </div>
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
