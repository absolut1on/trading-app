import { useEffect, useRef } from "react";
import { createChart, ColorType, AreaSeries, type IChartApi } from "lightweight-charts";
import type { TimeSeriesPoint } from "../types/stock";

interface Props {
  data: TimeSeriesPoint[];
  positive: boolean;
}

export default function PriceChart({ data, positive }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8b8fa3",
      },
      grid: {
        vertLines: { color: "#2a2d3a" },
        horzLines: { color: "#2a2d3a" },
      },
      width: containerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "#2a2d3a",
      },
      crosshair: {
        horzLine: { color: "#5a5e72" },
        vertLine: { color: "#5a5e72" },
      },
    });

    const lineColor = positive ? "#22c55e" : "#ef4444";
    const areaTopColor = positive
      ? "rgba(34, 197, 94, 0.3)"
      : "rgba(239, 68, 68, 0.3)";
    const areaBottomColor = positive
      ? "rgba(34, 197, 94, 0.02)"
      : "rgba(239, 68, 68, 0.02)";

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
      lineWidth: 2,
    });

    series.setData(
      data.map((p) => ({
        time: p.time as any,
        value: p.close,
      }))
    );

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data, positive]);

  return <div ref={containerRef} />;
}
