import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { StoreModalWrapper } from '@/components/modals/store-modal-wrapper';

const RootPage = async () => {
 const {userId} = await auth();
    const store = await prismadb.store.findFirst({
      where: {
        userId: userId ?? undefined,
      },
    });

    if (store) {
      redirect(`/${store.id}`);
    }
      return <StoreModalWrapper />;
  }



export default RootPage;