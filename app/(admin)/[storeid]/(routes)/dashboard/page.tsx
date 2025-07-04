import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, PartyPopper, ShoppingBag, User2 } from "lucide-react";
import React from "react";

const DashboardPage = () => {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle>Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234</div>
            <p className="text-sm text-muted-foreground">
              Based on 100 charges
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle>Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+50</div>
            <p className="text-sm text-muted-foreground">
              Total sales in your store
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle>Total Products</CardTitle>
            <PartyPopper className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-sm text-muted-foreground">
              Total products created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle>Total Users</CardTitle>
            <User2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-sm text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-10">
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Recent transactions fron your store</CardDescription>
            </CardHeader>
        </Card>
         <Card className="">
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                    <Avatar className="hidden sm:flex h-9 w-9">
                        <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <div className="text-sm font-medium">Alice Brown</div>
                        <div className="text-xs text-muted-foreground">test@gmail.com</div>
                    </div>
                    <div className="ml-auto text-sm font-medium">+$120.00</div>
                </div>
                <div className="flex items-center gap-4">
                    <Avatar className="hidden sm:flex h-9 w-9">
                        <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <div className="text-sm font-medium">Alice Brown</div>
                        <div className="text-xs text-muted-foreground">test@gmail.com</div>
                    </div>
                    <div className="ml-auto text-sm font-medium">+$120.00</div>
                </div>
                <div className="flex items-center gap-4">
                    <Avatar className="hidden sm:flex h-9 w-9">
                        <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <div className="text-sm font-medium">Alice Brown</div>
                        <div className="text-xs text-muted-foreground">test@gmail.com</div>
                    </div>
                    <div className="ml-auto text-sm font-medium">+$120.00</div>
                </div>
                <div className="flex items-center gap-4">
                    <Avatar className="hidden sm:flex h-9 w-9">
                        <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <div className="text-sm font-medium">Alice Brown</div>
                        <div className="text-xs text-muted-foreground">test@gmail.com</div>
                    </div>
                    <div className="ml-auto text-sm font-medium">+$120.00</div>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardPage;
