import { Header } from "@/components/Header";
import { FormAddress } from "./components/FormAddress";
import { Payment } from "./components/Payment";
import { Orders } from "./components/Orders";

export default function Profile() {
  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 mt-4 pb-4 gap-12 lg:gap-24 grid items-start lg:grid-cols-2">
        <section>
          <FormAddress />
          <Payment />
        </section>

        <Orders />
      </main>
    </>
  );
}
