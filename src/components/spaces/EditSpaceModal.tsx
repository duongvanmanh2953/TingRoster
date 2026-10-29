'use client';

import React from 'react';
import { X } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { SpaceSettingsForm } from '@/components/spaces/SpaceSettingsForm';

interface EditSpaceModalProps {
  space: {
    id: string;
    name: string;
    slug: string;
    code?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    themeColor?: string | null;
    enabledModules?: string | null;
    groupType?: string | null;
    defaultFee?: number;
    billingCycle?: string;
    publicPortalEnabled?: boolean;
    isActive?: boolean;
  };
  open: boolean;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

export function EditSpaceModal({
  space,
  open,
  onClose,
  onSuccess,
}: EditSpaceModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '1.25rem',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            backgroundImage: 'none',
          },
          className: 'dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {space.code || `TR-${space.slug.toUpperCase().slice(0, 4)}`}
              </span>
              <span className="text-xs text-slate-500 font-medium">Chỉnh sửa thông tin & tính năng</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              Thông tin không gian
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body reusing SpaceSettingsForm */}
        <div className="p-6">
          <SpaceSettingsForm
            space={space}
            onSuccess={(updated) => {
              onSuccess(updated);
              onClose();
            }}
            onCancel={onClose}
            isPageLayout={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
