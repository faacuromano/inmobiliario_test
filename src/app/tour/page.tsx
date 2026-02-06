import VirtualTour from "@/components/VirtualTour";
import { Header } from "@/components/header";

export default function TourPage() {
  return (
    <main className="w-full h-screen bg-white">
       <Header forceSolid />
       <VirtualTour />
    </main>
  );
}
