import React, { useState, useEffect } from "react";
import { Users, TrendingUp, Activity, Target } from "lucide-react";
import { supabase } from "../lib/supabase";

const KpiCard = ({ title, value, icon, color }) => (
  <div className="glass-panel" style={{ padding: "24px" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{title}</span>
      <div style={{ color }}>{icon}</div>
    </div>
    <h2 style={{ fontSize: "32px", margin: 0 }}>{value}</h2>
  </div>
);

const HRDashboard = () => {
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [trendDescription, setTrendDescription] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    avgScore: 0,
    roadmapCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [{ data, error }, { data: roadmapData, error: roadmapError }] =
        await Promise.all([
          supabase.from("profiles").select("*"),
          supabase.from("upskilling_recommendations").select("id"),
        ]);

      if (data && !error && !roadmapError) {
        const employees = data.filter((profile) => profile.role === "employee");
        const totalEmployees = employees.length;
        const totalScore = employees.reduce(
          (sum, employee) => sum + (employee.score || 0),
          0,
        );
        const avgScore =
          totalEmployees > 0 ? Math.round(totalScore / totalEmployees) : 0;

        setStats({
          totalEmployees,
          avgScore,
          roadmapCount: roadmapData?.length || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching HR stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleGenerateTrends = async () => {
    const description = trendDescription.trim();
    if (!description) {
      setFeedback({
        type: "error",
        text: "Enter the current industry priorities before generating trends.",
      });
      return;
    }

    setLoadingTrends(true);
    setFeedback(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "/api";
      const res = await fetch(`${backendUrl}/generate-trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const raw = await res.text();
      let data = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(
          data.message || `Request failed with status ${res.status}`,
        );
      }

      setFeedback({
        type: "success",
        text: data.message || "Trends generated successfully.",
      });
      await fetchStats();
      setTrendDescription("");
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        text: err.message || "Error generating trends.",
      });
    } finally {
      setLoadingTrends(false);
    }
  };

  if (loading)
    return (
      <div className="animate-fade-in">
        <p>Loading dashboard...</p>
      </div>
    );

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
          Executive HR Dashboard
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          AI-powered workforce intelligence overview.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        <KpiCard
          title="Total Employees"
          value={stats.totalEmployees.toLocaleString()}
          icon={<Users />}
          color="#00d2ff"
        />
        <KpiCard
          title="Avg AI Score"
          value={`${stats.avgScore}%`}
          icon={<TrendingUp />}
          color="#34d399"
        />
        <KpiCard
          title="Active Roadmaps"
          value={stats.roadmapCount.toString()}
          icon={<Target />}
          color="#eab308"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: "24px",
        }}
      >
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ marginBottom: "16px" }}>Generate Market Trends</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
            Describe the company&apos;s current priorities and we&apos;ll
            rescore the workforce against them.
          </p>
          <textarea
            className="glass-input"
            rows="5"
            placeholder="Example: prioritize AI agents, cloud cost optimization, product analytics, and enterprise security readiness."
            value={trendDescription}
            onChange={(event) => setTrendDescription(event.target.value)}
            style={{ width: "100%", resize: "vertical", marginBottom: "16px" }}
          />
          <button
            onClick={handleGenerateTrends}
            className="btn-primary"
            style={{ width: "auto" }}
            disabled={loadingTrends}
          >
            {loadingTrends ? "Generating..." : "Generate Trends"}
          </button>
          {feedback && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px 16px",
                borderRadius: "12px",
                background:
                  feedback.type === "error"
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(52,211,153,0.1)",
                color: feedback.type === "error" ? "#ef4444" : "#34d399",
                border: `1px solid ${feedback.type === "error" ? "rgba(239,68,68,0.2)" : "rgba(52,211,153,0.2)"}`,
              }}
            >
              {feedback.text}
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3
            style={{
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Activity size={20} color="#eab308" /> AI Insights
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                padding: "16px",
                background: "rgba(58, 123, 213, 0.1)",
                borderLeft: "4px solid #3a7bd5",
                borderRadius: "4px 12px 12px 4px",
              }}
            >
              <h4
                style={{
                  color: "#3a7bd5",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Overall Performance
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                The current average AI assessment score is {stats.avgScore} out
                of 100.
              </p>
            </div>
            <div
              style={{
                padding: "16px",
                background: "rgba(234, 179, 8, 0.1)",
                borderLeft: "4px solid #eab308",
                borderRadius: "4px 12px 12px 4px",
              }}
            >
              <h4
                style={{
                  color: "#eab308",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Roadmap Coverage
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                {stats.roadmapCount} roadmap assignment(s) are currently active
                across the workforce.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
