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

function getWeeksInCurrentMonth() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Find the first Monday of the month
  const firstMonday = new Date(firstDayOfMonth);
  const dayOfWeek = firstDayOfMonth.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
  firstMonday.setDate(firstDayOfMonth.getDate() + daysUntilMonday);

  const weeks = [];
  let currentWeekStart = new Date(firstMonday);

  while (currentWeekStart <= lastDayOfMonth) {
    weeks.push(new Date(currentWeekStart));
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
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
function getMonthsInCurrentYear() {
  const months = [];
  const today = new Date();
  const currentYear = today.getFullYear();

  // Generate Jan-Dec of current year
  for (let i = 0; i < 12; i++) {
    months.push(new Date(currentYear, i, 1));
  }

  return months;
}

function formatChartData(freqData, period) {
  let fullRange = [];
  let periodKeys = [];
  if (period === "year") {
    console.log("year f");

    const today = new Date();
    const currentYear = today.getFullYear();
    for (let i = 4; i >= 0; i--) {
      fullRange.push(new Date(currentYear - i, 0, 1));
    }
    console.log("FR", fullRange);
    periodKeys = fullRange.map((d) => d.getFullYear().toString());
  }
  if (period === "week") {
    fullRange = getWeeksInCurrentMonth();
    periodKeys = fullRange.map((d) => d.toISOString().slice(0, 10));
  } else if (period === "month") {
    fullRange = getMonthsInCurrentYear();
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
    if (period === "year") {
      const yearKey = new Date(period_start).getFullYear().toString();
      dataMap[yearKey] = Number(workout_count);
    } else {
      dataMap[period_start] = Number(workout_count);
    }
  });

  // Fill missing with zeros
  const dataPoints = periodKeys.map((key) => dataMap[key] || 0);

  console.log("FR2", fullRange);
  const labels = fullRange.map((d) => {
    if (period === "year") {
      console.log("year dates f: ", d);
      return d.getFullYear().toString();
    }
    if (period === "week") {
      return `${d.getMonth() + 1}/${d.getDate()}`;
    } else if (period === "month") {
      return d.toLocaleString("default", { month: "short" });
    } else {
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
  });

  return {
    labels,
    datasets: [{ data: dataPoints }],
  };
}

export default function FrequencyChart({ data, period }) {
  console.log("Frequency chartData: ", chartData);

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
        barPercentage: 0.5,
        formatYLabel: () => "",
      }}
      style={{ marginVertical: 8, borderRadius: 16, paddingRight: 5 }}
      fromZero
      showValuesOnTopOfBars
    />
  );
}
