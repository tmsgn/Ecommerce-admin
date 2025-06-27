import React from 'react'
import { CatagoryForm } from './components/catagory-form'
import prismadb from '@/lib/prismadb'

const page = async ({
    params
}: {
    params: { catagoryid: string }
}) => {

   const catagory = await prismadb.catagory.findUnique({
        where:{
            id: params.catagoryid
        }
    })
  return (
    <CatagoryForm initialData={catagory}/>
  )
}

export default page