//
//  ContentView.swift
//  BackyardGarden
//
//  Created by Gabriel Csapo on 2/8/26.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab("Home", systemImage: "leaf.fill", value: 0) {
                DashboardView()
            }

            Tab("Yards", systemImage: "square.grid.2x2.fill", value: 1) {
                YardListView()
            }

            Tab("Calendar", systemImage: "calendar", value: 2) {
                CalendarView()
            }

            Tab("Log", systemImage: "note.text", value: 3) {
                QuickLogView()
            }

            Tab("Settings", systemImage: "gearshape.fill", value: 4) {
                SettingsView()
            }
        }
        .tint(Color("GardenGreen"))
    }
}

#Preview {
    ContentView()
        .modelContainer(for: [
            Settings.self, Yard.self, YardElement.self, Plant.self,
            Planting.self, LogEntry.self, SeedInventoryItem.self,
            GardenTask.self, PestDisease.self, SoilProfile.self,
        ], inMemory: true)
        .environment(ServerDiscovery())
}
