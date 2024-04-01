"use client"
import { useQuery } from "@tanstack/react-query";

import { useUserInfo } from "@/context/User";
import { listOrders } from "@/graphql/queries/listOrders";

import { OrderLoading } from "./OrderLoading";
import { Order } from "./Order";

export function Orders() {
  const { user } = useUserInfo();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["orders", email],
    queryFn: () => listOrders({ email })
  });

  return (
    <div className="flex flex-col gap-4 mt-4">
      {isLoading ? (
        <OrderLoading />
      ) : (
        data?.orders.map((order, position) => (
          <Order key={order.id} order={order} position={position + 1} />
        ))
      )}
    </div>
  )
}