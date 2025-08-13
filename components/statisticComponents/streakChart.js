import React from "react";
import { View, Dimensions } from "react-native";
import { ContributionGraph } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function WorkoutHeatmap({ data }) {
  return (
    <View style={{ alignItems: "center" }}>
      <ContributionGraph
        values={data}
        endDate={new Date()}
        numDays={90} // last 3 months
        width={screenWidth - 20}
        height={220}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
          labelColor: () => "#333",
        }}
      />
    </View>
  );
}
