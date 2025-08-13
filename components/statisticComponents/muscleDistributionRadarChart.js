import React from "react";
import { Dimensions, Text, View } from "react-native";
import { RadarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;
const COLORS = [
  "#AF125A", // your main accent
  "#666666", // Medium grey
  "#D91A72", // Light magenta
  "#404040", // Dark grey
  "#999999", // Light grey
];

function groupMuscleDataForRadar(rawData, muscleGroupMap) {
  if (!rawData || !Array.isArray(rawData)) {
    return { labels: [], datasets: [] };
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

  // Convert to sorted array and get top muscle groups
  const sortedData = Object.entries(groupedData)
    .filter(([_, volume]) => volume > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Limit to top 6 for readability

  if (sortedData.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Find max volume for normalization
  const maxVolume = Math.max(...sortedData.map(([, volume]) => volume));

  // Create radar chart data structure
  const labels = sortedData.map(([name]) => name);
  const normalizedData = sortedData.map(([, volume]) => {
    // Normalize to 0-100 scale for better radar visualization
    return Math.round((volume / maxVolume) * 100);
  });

  return {
    labels: labels,
    datasets: [
      {
        data: normalizedData,
        color: (opacity = 1) => `rgba(175, 18, 90, ${opacity})`, // your accent color
        strokeWidth: 2,
      },
    ],
  };
}

export default function MuscleDistributionRadarChart({ data, muscleGroupMap }) {
  if (!data) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "white", textAlign: "center" }}>
          Loading muscle data...
        </Text>
      </View>
    );
  }

  const radarData = groupMuscleDataForRadar(data, muscleGroupMap);

  if (!radarData.labels || radarData.labels.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "white", textAlign: "center" }}>
          No muscle group data available
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
          Muscle Balance
        </Text>
        <Text
          style={{
            color: "#cccccc",
            fontSize: 14,
            textAlign: "center",
            marginBottom: 15,
            paddingHorizontal: 20,
          }}
        >
          Relative training volume across muscle groups
        </Text>
        <RadarChart
          data={radarData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(245, 241, 237, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(245, 241, 237, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              fontSize: 12,
              fontWeight: "bold",
            },
          }}
          accessor="data"
          absolute={false}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />

        {/* Legend showing actual volumes */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            paddingHorizontal: 20,
            marginTop: 10,
          }}
        >
          {radarData.labels.map((label, index) => {
            // Calculate actual volume for this muscle group
            const actualVolume = data
              .filter(
                (item) =>
                  (muscleGroupMap?.[item.muscle_group] || item.muscle_group) ===
                  label
              )
              .reduce((sum, item) => sum + Number(item.total_volume), 0);

            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  margin: 4,
                  backgroundColor: "rgba(26, 26, 26, 0.8)",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  borderLeftWidth: 3,
                  borderLeftColor: "#AF125A",
                }}
              >
                <Text
                  style={{
                    color: "#f5f1ed",
                    fontSize: 11,
                    fontWeight: "600",
                    marginRight: 4,
                  }}
                >
                  {label}:
                </Text>
                <Text
                  style={{
                    color: "#cccccc",
                    fontSize: 11,
                  }}
                >
                  {Math.round(actualVolume).toLocaleString()}kg
                </Text>
              </View>
            );
          })}
        </View>

        <Text
          style={{
            color: "#999999",
            fontSize: 12,
            textAlign: "center",
            marginTop: 10,
            fontStyle: "italic",
          }}
        >
          Chart shows relative proportions • Perfect balance = regular hexagon
        </Text>
      </View>
    );
  } catch (error) {
    console.error("RadarChart render error:", error);
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "red", textAlign: "center" }}>
          Chart Error: {error.message}
        </Text>
        <Text style={{ color: "white", textAlign: "center", fontSize: 12 }}>
          Data: {JSON.stringify(radarData, null, 2)}
        </Text>
      </View>
    );
  }
}
