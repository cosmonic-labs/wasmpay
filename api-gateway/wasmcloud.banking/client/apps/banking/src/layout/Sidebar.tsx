import React from 'react';
import {cn} from '@repo/ui/cn';

export function Sidebar({
  children,
  open,
  setOpen,
}: React.PropsWithChildren<{open: boolean; setOpen: (open: boolean) => void}>) {
  return (
    <>
      <MobileMenu open={open} onClose={() => setOpen(false)}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-surface px-6 pb-2 ring-1 ring-surface-contrast/10">
          <div className="flex h-16 shrink-0 items-center">
            <CompanyLogo />
          </div>
          {children}
        </div>
      </MobileMenu>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col ring-1 ring-surface-contrast/10">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-surface px-6 shadow-md">
          <div className="flex h-16 shrink-0 items-center">
            <CompanyLogo />
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

const MobileMenu = ({
  open,
  onClose,
  children,
}: React.PropsWithChildren<{open: boolean; onClose: () => void}>) => (
  <div
    className="relative z-50 lg:hidden transition data-[hidden=true]:opacity-0 data-[hidden=true]:delay-150 data-[hidden=true]:pointer-events-none data-[hidden=false]:opacity-100"
    role="dialog"
    aria-modal="true"
    data-hidden={open ? 'false' : 'true'}
  >
    <div
      className="fixed inset-0 bg-background/80 data-[hidden=true]:opacity-0 data-[hidden=false]:opacity-100"
      data-hidden={open ? 'false' : 'true'}
      aria-hidden={open ? 'false' : 'true'}
    ></div>

    <div className="fixed p-0 inset-0 flex">
      <div
        className={cn(
          'relative mr-16 flex w-full max-w-xs flex-1 transition ease-in-out duration-300 transform',
          'data-[open=false]:-translate-x-full',
          'data-[open=true]:-translate-x-0',
        )}
        data-open={open.toString()}
      >
        <div
          className={cn(
            'absolute left-full top-0 flex w-16 justify-center pt-5 ease-in-out duration-300 transition-opacity',
            'data-[open=false]:opacity-0',
            'data-[open=true]:opacity-100',
          )}
          data-open={open.toString()}
        >
          <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
            <span className="sr-only">Close sidebar</span>
            <svg
              className="h-6 w-6 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const CompanyLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 234.83"
    className="h-8 w-auto text-[#768692] dark:text-white"
  >
    <g fillRule="evenodd" fill="currentColor">
      <path d="M744.35,164.22h-19v-53.64c.04-3.49-.32-6.98-1.06-10.39-1.81-9.68-11.12-16.05-20.8-14.24-3.53.66-6.78,2.37-9.32,4.91-5.91,5.31-9.18,12.95-8.94,20.9v52.52h-18.77v-53.3c.03-3.24-.25-6.48-.84-9.67-.71-7.04-5.76-12.87-12.63-14.58-7.58-1.96-15.59.81-20.34,7.04-3.75,4.41-5.9,9.97-6.09,15.76-.34,8.16,0,16.37-.34,24.58s0,18.1,0,27.15v3.18h-19v-93.92h11.96c.67,0,1.56,1.12,1.79,1.9,1.01,3.13,1.84,6.37,2.79,10,7.27-8.88,18.14-14.04,29.61-14.08,11.65-.3,22.47,6.02,27.94,16.32l2.23-2.74c11.19-14.22,31.28-17.75,46.65-8.21,9.17,6.05,14.66,16.33,14.58,27.32.5,20.73,0,41.51,0,62.3-.1.32-.25.62-.45.89Z" />
      <path d="M356.53,134.11c2.01-5.98,3.86-11.17,5.59-16.76,4.97-14.69,10-29.33,14.81-44.08.37-1.92,2.21-3.19,4.13-2.85h16.15c-1.96,5.92-3.8,11.17-5.59,16.76-8.16,24.96-16.37,49.91-24.64,74.87-.67,1.96-1.51,2.74-3.63,2.63h-10.56c-1.48.25-2.91-.67-3.3-2.12-7.26-17.25-14.6-34.47-22.01-51.68-.34-.84-.73-1.62-1.4-2.96l-6.59,15.64c-5.48,12.7-10.9,25.53-16.26,38.5-.73,1.68-1.45,2.51-3.41,2.4-3.61-.22-7.23-.22-10.84,0-2.01,0-2.68-.78-3.3-2.46-9.42-28.42-18.98-56.79-28.66-85.1l-2.07-6.37h18.72c.56,0,1.4,1.23,1.68,2.07,5.81,17.02,11.55,34.06,17.21,51.12,1.01,3.07,2.07,6.09,3.3,9.67.67-1.4,1.12-2.23,1.51-3.13,8.16-18.62,16.28-37.44,24.36-56.43.89-2.23,2.23-2.4,4.19-2.46s3.35.34,4.25,2.46c8.27,19,16.26,37.94,24.7,56.54l1.68,3.74Z" />
      <path d="M499.68,164.17h-15.2l-1.96-11.17c-11.55,11.1-27.82,15.82-43.53,12.63-11.33-1.8-21.58-7.78-28.72-16.76-14.73-19.47-13.82-46.59,2.18-65.04,19.07-19.81,50.58-20.42,70.39-1.35,0,0,0,0,0,0,.67-3.46,1.34-6.54,1.84-9.61,0-1.56.89-2.18,2.57-2.12h10.5c1.51,0,2.18.34,2.18,2.01,0,30.28,0,60.55,0,90.79,0,0,0,.59-.28.61ZM419.39,117.34c0,16.97,13.76,30.73,30.73,30.73s30.73-13.76,30.73-30.73-13.76-30.73-30.73-30.73-30.73,13.76-30.73,30.73Z" />
      <path d="M1188.43,85.66v-42.35h11.57v121.19h-8.94l-1.79-15.31c-10.21,12.34-25.85,18.84-41.79,17.38-11.88-.55-23.07-5.72-31.18-14.42-16.76-19.02-17.35-47.35-1.4-67.05,6.08-6.97,14.12-11.94,23.08-14.25,8.8-2.38,18.07-2.38,26.88,0,9.16,2.47,17.37,7.63,23.58,14.81ZM1152.28,155.28c20.15.29,36.72-15.81,37-35.96,0-.57,0-1.13-.02-1.7.64-20.45-15.41-37.55-35.86-38.19-20.45-.64-37.55,15.41-38.19,35.86-.03.94-.02,1.89.02,2.83-.5,20.02,15.33,36.65,35.35,37.15.57.01,1.13.01,1.7,0Z" />
      <path d="M895.88,117.85c0-27.22,22.07-49.28,49.29-49.27,27.21,0,49.27,22.06,49.27,49.27,0,27.22-22.07,49.28-49.29,49.27-27.21,0-49.27-22.06-49.27-49.27ZM945.22,155.28c20.08.54,36.8-15.31,37.33-35.39.02-.76.02-1.51-.01-2.27,0-20.64-16.74-37.38-37.38-37.38s-37.38,16.74-37.38,37.38c-.78,20.01,14.81,36.87,34.82,37.65.87.03,1.75.04,2.62,0Z" />
      <path d="M855.26,101.25h-9.78c-.89,0-2.01-1.17-2.57-2.07-9.86-17.68-32.18-24.02-49.86-14.16-13.03,7.27-20.36,21.71-18.53,36.51,1.49,20.06,18.96,35.12,39.03,33.63,7.17-.53,14.02-3.18,19.7-7.6,3.56-3.14,6.63-6.79,9.11-10.84.96-1.95,3.04-3.09,5.2-2.85h7.65c-.89,16.26-22.74,32.35-44.2,32.8-25.57.56-47.03-19.17-48.61-44.7-2.71-25.29,14.8-48.29,39.89-52.41,24.25-3.86,47.77,9.95,52.97,31.68Z" />
      <path d="M1008.07,71.14h11.57v51.4c0,4.63.62,9.23,1.84,13.69,5.36,14.96,21.84,22.74,36.8,17.37,8.35-2.99,14.85-9.67,17.62-18.1,1.12-4.25,1.68-8.63,1.68-13.02v-51.24h11.96v3.58c0,16.48.28,32.97,0,49.39-.06,6.32-1.1,12.6-3.07,18.61-6.12,15.9-22.17,25.71-39.11,23.91-24.19-1.23-38.83-16.15-39.11-40.34-.28-17.54,0-35.14,0-52.74-.1-.83-.16-1.67-.17-2.51Z" />
      <path d="M871.63,43.37h11.17v121.08h-11.17V43.37Z" />
      <path d="M573.26,111.76c-2.15-.78-4.35-1.39-6.59-1.84-5.59-1.12-11.17-1.96-16.76-3.18-3.43-.68-6.77-1.77-9.95-3.24-4.2-1.95-6.02-6.93-4.07-11.13.41-.89.98-1.7,1.67-2.39,1.42-1.58,3.18-2.82,5.14-3.63,6.35-2.51,13.43-2.51,19.78,0,4.56,1.51,7.82,5.55,8.33,10.34v.34c.05.34.33.59.67.61h0l14.64-4.41c1.23-.35,1.96-1.61,1.68-2.85-1.36-5.82-4.85-10.92-9.78-14.3-12-8.68-27.61-10.6-41.35-5.08-13.09,4.69-21.27,17.74-19.78,31.57,1.47,8.83,8.06,15.93,16.76,18.05,6.76,2.12,13.86,3.18,20.73,4.92,4.24.84,8.38,2.14,12.35,3.86,4.64,2.24,6.58,7.82,4.34,12.46-.62,1.29-1.53,2.41-2.66,3.29-1.67,1.36-3.56,2.42-5.59,3.13-5.64,1.96-11.75,2.12-17.49.45-5.6-1.15-10.08-5.37-11.57-10.9-.09-.42-.2-.83-.34-1.23-.05-.34-.33-.59-.67-.61h0l-15.09,4.53c-1.25.35-1.97,1.65-1.62,2.89,0,0,0,0,0,.01,1.93,7.1,6.61,13.14,13.02,16.76,13.4,7.68,29.65,8.57,43.81,2.4,8.86-3.18,15.44-10.73,17.38-19.95,2.95-13.1-4.34-26.34-16.99-30.84Z" />
      <path
        fill="#00bc8e"
        d="M198.74,53.59L110.57,2.13c-4.81-2.84-10.78-2.84-15.59,0L6.82,53.59C2.59,56.07,0,60.6,0,65.49v103.76c.01,4.99,2.67,9.61,6.98,12.12l88,51.4c4.72,2.74,10.54,2.74,15.25,0l88.17-51.4c4.31-2.52,6.97-7.13,6.98-12.12v-103.76c.03-4.86-2.49-9.38-6.65-11.9ZM179.13,155.62c0,.96-.51,1.86-1.34,2.35l-73.64,43.19c-.42.26-.9.4-1.4.39-.48,0-.94-.13-1.34-.39l-73.47-43.19c-.86-.49-1.37-1.42-1.34-2.4v-76.38c0-.98.5-1.89,1.34-2.4l26.54-15.31c1.35-.74,3.05-.25,3.79,1.11.21.38.33.81.34,1.24v71.35l24.03-14.02V46.33c-.06-.94.39-1.83,1.17-2.35l17.6-10.45c.86-.45,1.88-.45,2.74,0l17.43,10.22c.83.49,1.34,1.38,1.34,2.35v75.04l24.03,13.97V63.43c.06-1.54,1.35-2.75,2.89-2.69.43.02.86.13,1.24.34l26.71,15.76c.85.47,1.36,1.38,1.34,2.35v76.44Z"
      />
    </g>
  </svg>
);
