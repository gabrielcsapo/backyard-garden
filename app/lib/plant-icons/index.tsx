import React from "react";
import type { IconRenderer } from "./types";

import { TomatoIcon } from "./tomato";
import { PepperIcon } from "./pepper";
import { HotPepperIcon } from "./hot-pepper";
import { EggplantIcon } from "./eggplant";
import { TomatilloIcon } from "./tomatillo";
import { GroundCherryIcon } from "./ground-cherry";
import { PotatoIcon } from "./potato";
import { SweetPotatoIcon } from "./sweet-potato";
import { CucumberIcon } from "./cucumber";
import { ZucchiniIcon } from "./zucchini";
import { SummerSquashIcon } from "./summer-squash";
import { WinterSquashIcon } from "./winter-squash";
import { PumpkinIcon } from "./pumpkin";
import { WatermelonIcon } from "./watermelon";
import { CantaloupeIcon } from "./cantaloupe";
import { HoneydewIcon } from "./honeydew";
import { CornIcon } from "./corn";
import { OkraIcon } from "./okra";
import { StrawberryIcon } from "./strawberry";
import { LettuceIcon } from "./lettuce";
import { RomaineLettuceIcon } from "./romaine-lettuce";
import { SpinachIcon } from "./spinach";
import { KaleIcon } from "./kale";
import { SwissChardIcon } from "./swiss-chard";
import { ArugulaIcon } from "./arugula";
import { CollardGreensIcon } from "./collard-greens";
import { BokChoyIcon } from "./bok-choy";
import { EndiveIcon } from "./endive";
import { RadicchioIcon } from "./radicchio";
import { MustardGreensIcon } from "./mustard-greens";
import { MizunaIcon } from "./mizuna";
import { WatercressIcon } from "./watercress";
import { SorrelIcon } from "./sorrel";
import { BroccoliIcon } from "./broccoli";
import { CauliflowerIcon } from "./cauliflower";
import { CabbageIcon } from "./cabbage";
import { BrusselsSproutsIcon } from "./brussels-sprouts";
import { KohlrabiIcon } from "./kohlrabi";
import { ArtichokeIcon } from "./artichoke";
import { CarrotIcon } from "./carrot";
import { BeetIcon } from "./beet";
import { RadishIcon } from "./radish";
import { TurnipIcon } from "./turnip";
import { ParsnipIcon } from "./parsnip";
import { RutabagaIcon } from "./rutabaga";
import { DaikonRadishIcon } from "./daikon-radish";
import { CeleryIcon } from "./celery";
import { FennelIcon } from "./fennel";
import { CeleriacIcon } from "./celeriac";
import { AsparagusIcon } from "./asparagus";
import { RhubarbIcon } from "./rhubarb";
import { OnionIcon } from "./onion";
import { GarlicIcon } from "./garlic";
import { LeekIcon } from "./leek";
import { ShallotIcon } from "./shallot";
import { ChivesIcon } from "./chives";
import { ScallionIcon } from "./scallion";
import { GingerIcon } from "./ginger";
import { BasilIcon } from "./basil";
import { CilantroIcon } from "./cilantro";
import { ParsleyIcon } from "./parsley";
import { DillIcon } from "./dill";
import { OreganoIcon } from "./oregano";
import { ThymeIcon } from "./thyme";
import { RosemaryIcon } from "./rosemary";
import { SageIcon } from "./sage";
import { MintIcon } from "./mint";
import { LavenderIcon } from "./lavender";
import { TarragonIcon } from "./tarragon";
import { LemongrassIcon } from "./lemongrass";
import { PeasIcon } from "./peas";
import { GreenBeansIcon } from "./green-beans";
import { LimaBeansIcon } from "./lima-beans";
import { EdamameIcon } from "./edamame";
import { PoleBeansIcon } from "./pole-beans";
import { ChamomileIcon } from "./chamomile";
import { SunflowerIcon } from "./sunflower";
import { MarigoldIcon } from "./marigold";
import { DahliaIcon } from "./dahlia";
import { NasturtiumIcon } from "./nasturtium";

const ICONS: Record<string, IconRenderer> = {
  Tomato: TomatoIcon,
  Pepper: PepperIcon,
  "Hot Pepper": HotPepperIcon,
  Eggplant: EggplantIcon,
  Tomatillo: TomatilloIcon,
  "Ground Cherry": GroundCherryIcon,
  Potato: PotatoIcon,
  "Sweet Potato": SweetPotatoIcon,
  Cucumber: CucumberIcon,
  Zucchini: ZucchiniIcon,
  "Summer Squash": SummerSquashIcon,
  "Winter Squash": WinterSquashIcon,
  Pumpkin: PumpkinIcon,
  Watermelon: WatermelonIcon,
  Cantaloupe: CantaloupeIcon,
  Honeydew: HoneydewIcon,
  Corn: CornIcon,
  Okra: OkraIcon,
  Strawberry: StrawberryIcon,
  Lettuce: LettuceIcon,
  "Romaine Lettuce": RomaineLettuceIcon,
  Spinach: SpinachIcon,
  Kale: KaleIcon,
  "Swiss Chard": SwissChardIcon,
  Arugula: ArugulaIcon,
  "Collard Greens": CollardGreensIcon,
  "Bok Choy": BokChoyIcon,
  Endive: EndiveIcon,
  Radicchio: RadicchioIcon,
  "Mustard Greens": MustardGreensIcon,
  Mizuna: MizunaIcon,
  Watercress: WatercressIcon,
  Sorrel: SorrelIcon,
  Broccoli: BroccoliIcon,
  Cauliflower: CauliflowerIcon,
  Cabbage: CabbageIcon,
  "Brussels Sprouts": BrusselsSproutsIcon,
  Kohlrabi: KohlrabiIcon,
  Artichoke: ArtichokeIcon,
  Carrot: CarrotIcon,
  Beet: BeetIcon,
  Radish: RadishIcon,
  Turnip: TurnipIcon,
  Parsnip: ParsnipIcon,
  Rutabaga: RutabagaIcon,
  "Daikon Radish": DaikonRadishIcon,
  Celery: CeleryIcon,
  Fennel: FennelIcon,
  Celeriac: CeleriacIcon,
  Asparagus: AsparagusIcon,
  Rhubarb: RhubarbIcon,
  Onion: OnionIcon,
  Garlic: GarlicIcon,
  Leek: LeekIcon,
  Shallot: ShallotIcon,
  Chives: ChivesIcon,
  Scallion: ScallionIcon,
  Ginger: GingerIcon,
  Basil: BasilIcon,
  Cilantro: CilantroIcon,
  Parsley: ParsleyIcon,
  Dill: DillIcon,
  Oregano: OreganoIcon,
  Thyme: ThymeIcon,
  Rosemary: RosemaryIcon,
  Sage: SageIcon,
  Mint: MintIcon,
  Lavender: LavenderIcon,
  Tarragon: TarragonIcon,
  Lemongrass: LemongrassIcon,
  Peas: PeasIcon,
  "Green Beans": GreenBeansIcon,
  "Lima Beans": LimaBeansIcon,
  Edamame: EdamameIcon,
  "Pole Beans": PoleBeansIcon,
  Chamomile: ChamomileIcon,
  Sunflower: SunflowerIcon,
  Marigold: MarigoldIcon,
  Dahlia: DahliaIcon,
  Nasturtium: NasturtiumIcon,
};

export function PlantIcon({
  name,
  className = "",
  size = 24,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const renderer = ICONS[name];
  if (!renderer) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label={name}
    >
      {renderer()}
    </svg>
  );
}

export function hasPlantIcon(name: string): boolean {
  return name in ICONS;
}

export function getPlantIconRenderer(name: string): IconRenderer | null {
  return ICONS[name] ?? null;
}
