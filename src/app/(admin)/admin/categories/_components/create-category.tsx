"use client";

import { Button } from '@/components/ui/button'
import { useModal } from '@/stores/modal-store'
import React from 'react'

export const CreateCategory = () => {
  const {open} = useModal();
  return (
    <div>
      <Button>Create</Button>
    </div>
  )
}
