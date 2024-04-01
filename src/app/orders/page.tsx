import { ShoppingBag } from "lucide-react";

import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { Orders } from "./components/Orders";

export default function Profile() {
  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 pb-4 flex flex-col gap-12">
        <section>
          <div className="flex justify-end">
            <Badge>
              <ShoppingBag /> Meus pedidos
            </Badge>
          </div>

          <Orders />
        </section>
      </main>
    </>
  );
}
