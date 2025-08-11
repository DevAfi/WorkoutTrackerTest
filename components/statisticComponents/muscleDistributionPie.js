import React from "react";
import { Dimensions, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;
const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#C9CBCF",
];

function groupMuscleData(rawData, muscleGroupMap) {
  if (!rawData || !Array.isArray(rawData)) {
    console.log("Invalid rawData:", rawData);
    return [];
  }

  const groupedData = {};

  rawData.forEach((item) => {
    if (!item || typeof item !== "object") {
      console.log("Invalid item:", item);
      return;
    }

    if (typeof item.total_volume !== "number" && !item.total_volume) {
      console.log("Invalid total_volume for item:", item);
      return;
    }

    const groupName =
      muscleGroupMap?.[item.muscle_group] || item.muscle_group || "Other";

    const volume = Number(item.total_volume) || 0;

    if (groupedData[groupName]) {
      groupedData[groupName] += volume;
    } else {
      groupedData[groupName] = volume;
    }
  });

  const result = Object.entries(groupedData)
    .filter(([_, volume]) => volume > 0)
    .map(([name, population], i) => {
      const chartEntry = {
        name: String(name),
        population: Number(population),
        color: COLORS[i % COLORS.length] || "#999999",
        legendFontColor: "#fff",
        legendFontSize: 14,
      };

      if (
        !chartEntry.name ||
        !chartEntry.color ||
        typeof chartEntry.population !== "number"
      ) {
        console.error("Invalid chart entry:", chartEntry);
        return null;
      }

      return chartEntry;
    })
    .filter((entry) => entry !== null)
    .sort((a, b) => b.population - a.population);

  console.log("Final chart data validation:");
  result.forEach((entry, index) => {
    if (!entry.color) {
      console.error(`Entry ${index} missing color:`, entry);
    }
  });

  return result;
}

export default function MuscleDistributionPieChart({ data, muscleGroupMap }) {
  if (!data) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "white", textAlign: "center" }}>
          Loading muscle data...
        </Text>
      </View>
    );
  }

  const chartData = groupMuscleData(data, muscleGroupMap);

  console.log("Raw data:", data);
  console.log("Pie chartData:", chartData);

  if (!chartData || chartData.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "white", textAlign: "center" }}>
          No muscle group data available
        </Text>
      </View>
    );
  }

  const hasValidData = chartData.every(
    (item) =>
      item &&
      typeof item === "object" &&
      item.name &&
      item.color &&
      typeof item.population === "number" &&
      item.population > 0
  );

  if (!hasValidData) {
    console.error("Invalid chart data detected:", chartData);
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "white", textAlign: "center" }}>
          Error: Invalid chart data
        </Text>
      </View>
    );
  }

  try {
    return (
      <View>
        <Text
          style={{
            color: "#AF125A",
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Muscle Distribution
        </Text>
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
        />
      </View>
    );
  } catch (error) {
    console.error("PieChart render error:", error);
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "red", textAlign: "center" }}>
          Chart Error: {error.message}
        </Text>
        <Text style={{ color: "white", textAlign: "center", fontSize: 12 }}>
          Data: {JSON.stringify(chartData, null, 2)}
        </Text>
      </View>
    );
  }
}
