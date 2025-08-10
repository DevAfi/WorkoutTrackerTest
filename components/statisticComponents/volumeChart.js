import React from "react";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

function formatChartData(volumeData, period) {
  const labels = volumeData.map(({ period_start }) => {
    const d = new Date(period_start);
    if (period === "week") {
      const weekStart = new Date(d);
      const weekEnd = new Date(d);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${
        weekEnd.getMonth() + 1
      }/${weekEnd.getDate()}`;
    } else if (period === "month") {
      return d.toLocaleString("default", { month: "short", year: "numeric" });
    } else if (period === "year") {
      return d.getFullYear().toString();
    }
    // default day format
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  const dataPoints = volumeData.map(({ total_volume }) => Number(total_volume));

  return {
    labels,
    datasets: [{ data: dataPoints }],
  };
}

export default function VolumeChart({ data }) {
  const chartData = formatChartData(data);

  return (
    <LineChart
      data={chartData}
      width={screenWidth - 40}
      height={220}
      chartConfig={{
        backgroundColor: "#333",
        backgroundGradientFrom: "#333",
        backgroundGradientTo: "#333",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      }}
      style={{ marginVertical: 8, borderRadius: 16 }}
      bezier
    />
  );
}
