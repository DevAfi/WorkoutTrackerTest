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

function formatChartData(volumeData, period) {
  let fullRange = [];
  let periodKeys = [];

  if (period === "year") {
    console.log("year");

    const today = new Date();
    const currentYear = today.getFullYear();
    for (let i = 4; i >= 0; i--) {
      fullRange.push(new Date(currentYear - i, 0, 1));
    }
    periodKeys = fullRange.map((d) => d.getFullYear().toString());
  } else if (period === "week") {
    console.log("week");
    fullRange = getWeeksInCurrentMonth();
    periodKeys = fullRange.map((d) => d.toISOString().slice(0, 10)); // YYYY-MM-DD
  } else if (period === "month") {
    console.log("month");
    fullRange = getMonthsInCurrentYear();
    periodKeys = fullRange.map(
      (d) =>
        `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-01`
    );
  } else {
    // default day = last 7 days
    console.log("day");
    fullRange = getLastNDays(7);
    periodKeys = fullRange.map((d) => d.toISOString().slice(0, 10));
  }

  // Map volume data by period_start
  const dataMap = {};
  volumeData.forEach(({ period_start, total_volume }) => {
    if (period === "year") {
      const yearKey = new Date(period_start).getFullYear().toString();
      dataMap[yearKey] = Number(total_volume);
    } else {
      dataMap[period_start] = Number(total_volume);
    }
  });

  // Fill missing with zeros
  const dataPoints = periodKeys.map((key) => dataMap[key] || 0);

  const labels = fullRange.map((d) => {
    if (period === "year") {
      console.log("year dates: ", d);
      return d.getFullYear().toString();
    } else if (period === "week") {
      console.log("week dates: ", d);
      // Show week number or date range
      const endDate = new Date(d);
      endDate.setDate(d.getDate() + 6);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    } else if (period === "month") {
      console.log("month dates: ", d);
      return d.toLocaleString("default", { month: "short" });
    } else {
      // day
      console.log("day dates: ", d);
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
  console.log("Volume chartData ", chartData);

  return (
    <LineChart
      data={chartData}
      width={screenWidth - 50}
      height={220}
      chartConfig={{
        backgroundColor: "#252222",
        backgroundGradientFrom: "#252222",
        backgroundGradientTo: "#252222",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(175, 18, 90, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      }}
      style={{ marginBottom: 8, borderRadius: 16 }}
      bezier
    />
  );
}
