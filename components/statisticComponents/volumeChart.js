import React from "react";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

function getLastNDays(n) {
  const days = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

function getLastNWeeks(n) {
  const weeks = [];
  const today = new Date();
  const dayOfWeek = today.getDay() || 7; // Sunday=0, convert to 7
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  for (let i = n - 1; i >= 0; i--) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - i * 7);
    weeks.push(weekStart);
  }
  return weeks;
}

function getLastNMonths(n) {
  const months = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  for (let i = n - 1; i >= 0; i--) {
    let y = year;
    let m = month - i;
    if (m < 0) {
      y -= 1;
      m += 12;
    }
    months.push(new Date(y, m, 1));
  }
  return months;
}

function formatChartData(volumeData, period) {
  let fullRange = [];
  let periodKeys = [];

  if (period === "year") {
    // Get last 5 years for example (adjust as needed)
    const today = new Date();
    const currentYear = today.getFullYear();
    for (let i = 4; i >= 0; i--) {
      fullRange.push(new Date(currentYear - i, 0, 1)); // Jan 1 of each year
    }
    periodKeys = fullRange.map((d) => d.getFullYear().toString());
  } else if (period === "week") {
    fullRange = getLastNWeeks(4);
    periodKeys = fullRange.map((d) => d.toISOString().slice(0, 10)); // YYYY-MM-DD
  } else if (period === "month") {
    fullRange = getLastNMonths(12);
    periodKeys = fullRange.map(
      (d) =>
        `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-01`
    );
  } else {
    // default day = last 7 days
    fullRange = getLastNDays(7);
    periodKeys = fullRange.map((d) => d.toISOString().slice(0, 10));
  }

  // Map volume data by period_start
  const dataMap = {};
  volumeData.forEach(({ period_start, total_volume }) => {
    if (period === "year") {
      // year key: just the year string
      const yearKey = new Date(period_start).getFullYear().toString();
      dataMap[yearKey] = Number(total_volume);
    } else {
      dataMap[period_start] = Number(total_volume);
    }
  });

  // Fill missing with zeros
  const dataPoints = periodKeys.map((key) => dataMap[key] || 0);

  // Labels simplified — just starting date or year string
  const labels = fullRange.map((d) => {
    if (period === "year") {
      return d.getFullYear().toString();
    } else if (period === "week") {
      // Only show start date (MM/DD)
      return `${d.getMonth() + 1}/${d.getDate()}`;
    } else if (period === "month") {
      return d.toLocaleString("default", { month: "short" });
    } else {
      // day
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
  });

  return {
    labels,
    datasets: [{ data: dataPoints }],
  };
}

export default function VolumeChart({ data, period }) {
  const chartData = formatChartData(data, period);

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
