import React from "react";
import { BarChart } from "react-native-chart-kit";
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
  const dayOfWeek = today.getDay() || 7; // Sunday=0 → 7
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

function formatChartData(freqData, period) {
  let fullRange = [];
  let periodKeys = [];

  if (period === "week") {
    fullRange = getLastNWeeks(4);
    periodKeys = fullRange.map((d) => d.toISOString().slice(0, 10));
  } else if (period === "month") {
    fullRange = getLastNMonths(12);
    periodKeys = fullRange.map(
      (d) =>
        `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-01`
    );
  } else {
    fullRange = getLastNDays(7);
    periodKeys = fullRange.map((d) => d.toISOString().slice(0, 10));
  }

  const dataMap = {};
  freqData.forEach(({ period_start, workout_count }) => {
    dataMap[period_start] = workout_count;
  });

  const dataPoints = periodKeys.map((key) => dataMap[key] || 0);

  const labels = fullRange.map((d) => {
    if (period === "week") {
      return `${d.getMonth() + 1}/${d.getDate()}`;
    } else if (period === "month") {
      return d.toLocaleString("default", { month: "short", year: "numeric" });
    } else {
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
  });

  return {
    labels,
    datasets: [{ data: dataPoints }],
  };
}

export default function frequencyChart({ data, period }) {
  const chartData = formatChartData(data, period);

  return (
    <BarChart
      data={chartData}
      width={screenWidth - 40}
      height={220}
      chartConfig={{
        backgroundColor: "#222",
        backgroundGradientFrom: "#222",
        backgroundGradientTo: "#222",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      }}
      style={{ marginVertical: 8, borderRadius: 16 }}
      fromZero
    />
  );
}
