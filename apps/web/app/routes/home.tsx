import type { Route } from "./+types/home";
import MechanicScheduler from "../components/MechanicScheduler/MechanicScheduler";
import { queryClient } from "~/api/queryClient";
import { mechanicQueryOptions } from "~/api/queries/getMechanics";
import { useLoaderData } from "react-router";
import { ordersQueryOptions } from "~/api/queries/getOrders";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export const clientLoader = async () => {
  const mechanics = await queryClient.fetchQuery(mechanicQueryOptions);
  const orders = await queryClient.fetchQuery(ordersQueryOptions);
  return { mechanics: mechanics.data, orders: orders.data };
};

export default function Home() {
  const { mechanics, orders } = useLoaderData<typeof clientLoader>();
  return <MechanicScheduler mechanics={mechanics} orders={orders} />;
}
