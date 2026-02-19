/**
 * Interplanting guilds — polyculture combinations that work well together.
 */

export type Guild = {
  name: string;
  description: string;
  plants: string[];
  benefits: string[];
};

export const GUILDS: Guild[] = [
  {
    name: "Three Sisters",
    description: "Classic Native American polyculture combining corn, beans, and squash.",
    plants: ["Corn", "Pole Beans", "Winter Squash"],
    benefits: [
      "Corn provides structure for beans to climb",
      "Beans fix nitrogen for corn and squash",
      "Squash leaves shade ground to suppress weeds and retain moisture",
    ],
  },
  {
    name: "Mediterranean Herb Spiral",
    description: "A companion planting of Mediterranean herbs that thrive together in dry conditions.",
    plants: ["Basil", "Oregano", "Thyme", "Rosemary"],
    benefits: [
      "All tolerate dry, well-drained soil",
      "Aromatic oils deter pests",
      "Compact vertical planting saves space",
    ],
  },
  {
    name: "Tomato Guild",
    description: "Companion plants that support healthy tomato growth.",
    plants: ["Tomato", "Basil", "Carrots", "Marigolds"],
    benefits: [
      "Basil repels aphids and improves tomato flavor",
      "Carrots loosen soil for tomato roots",
      "Marigolds repel nematodes and whiteflies",
    ],
  },
  {
    name: "Brassica Protection",
    description: "Plants that protect brassicas from common pests.",
    plants: ["Broccoli", "Dill", "Onions", "Nasturtium"],
    benefits: [
      "Dill attracts beneficial parasitic wasps",
      "Onions deter cabbage maggots",
      "Nasturtium acts as trap crop for aphids",
    ],
  },
  {
    name: "Salad Bowl",
    description: "Quick-growing salad ingredients that interplant well.",
    plants: ["Lettuce", "Radishes", "Spinach", "Chives"],
    benefits: [
      "Radishes mark rows and break up soil",
      "Lettuce provides ground shade for spinach in heat",
      "Chives deter aphids",
    ],
  },
  {
    name: "Squash Fortress",
    description: "Plants that protect and support squash family crops.",
    plants: ["Zucchini", "Nasturtium", "Corn", "Sunflower"],
    benefits: [
      "Nasturtium repels squash bugs",
      "Corn provides windbreak",
      "Sunflowers attract pollinators for squash",
    ],
  },
  {
    name: "Root Crop Mix",
    description: "Underground companions that don't compete for space.",
    plants: ["Carrots", "Onions", "Radishes", "Beets"],
    benefits: [
      "Onions repel carrot rust fly",
      "Radishes mature fast, freeing space for slower crops",
      "Different root depths minimize competition",
    ],
  },
  {
    name: "Pollinator Paradise",
    description: "Flowers and herbs that attract beneficial insects.",
    plants: ["Sunflower", "Marigolds", "Lavender", "Dill"],
    benefits: [
      "Attracts bees, butterflies, and beneficial wasps",
      "Improves pollination of nearby food crops",
      "Provides habitat for predatory insects",
    ],
  },
  {
    name: "Nitrogen Bank",
    description: "Cover crop combination for building soil fertility.",
    plants: ["Crimson Clover", "Winter Rye", "Hairy Vetch"],
    benefits: [
      "Clover and vetch fix atmospheric nitrogen",
      "Rye provides biomass and weed suppression",
      "Roots improve soil structure at different depths",
    ],
  },
  {
    name: "Pepper Partners",
    description: "Plants that support pepper growth and deter pests.",
    plants: ["Peppers", "Basil", "Carrots", "Spinach"],
    benefits: [
      "Basil repels aphids and spider mites",
      "Spinach acts as living mulch in spring",
      "Carrots loosen soil without competing for light",
    ],
  },
];
