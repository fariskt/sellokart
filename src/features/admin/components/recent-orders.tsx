import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Props {
  orders: Order[];
}

export function RecentOrders({
  orders,
}: Props) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="font-medium">
          Recent Orders
        </h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Order
            </TableHead>

            <TableHead>
              Amount
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead>
              Date
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                {order.order_number}
              </TableCell>

              <TableCell>
                ₹
                {order.total_amount.toLocaleString()}
              </TableCell>

              <TableCell>
                <Badge>
                  {order.status}
                </Badge>
              </TableCell>

              <TableCell>
                {new Date(
                  order.created_at
                ).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}