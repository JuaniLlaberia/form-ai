'use client';

import { CalendarDays, Type } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

import RemoveFieldBtn from './(components)/RemoveFieldBtn';
import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from '@/app/dashboard/form/[formId]/edit/(components)/FormElements';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useFormContext } from '@/app/dashboard/form/[formId]/edit/(components)/FormContext';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { formatDate } from '@/lib/formatters';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';

const type: ElementsType = 'DateField';

const extraAttributes = {
  label: 'Date field',
  helperText: 'Pick a date',
  required: false,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(20),
  helperText: z.string().optional(),
  required: z.boolean().default(false),
});

export const DateFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  sidebarBtnElement: {
    icon: <CalendarDays />,
    label: 'Date field',
  },

  designComponent: DesignComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string) => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) return currentValue.length > 0;

    return true;
  },
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function DesignComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const extraAtt = element.extraAttributes;

  return (
    <div className='flex flex-col w-full gap-2'>
      <Label>{extraAtt.label}</Label>
      <Button
        variant='outline'
        className='w-full justify-start text-left font-normal bg-background-2 text-muted-foreground'
      >
        <CalendarDays className='size-4 mr-2' />
        <span>Pick a date</span>
      </Button>
      <p className='text-xs text-muted-foreground px-1'>
        {extraAtt.helperText ? extraAtt.helperText : null}
      </p>
    </div>
  );
}

function FormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: {
  elementInstance: FormElementInstance;
  submitValue?: SubmitFunction;
  isInvalid?: boolean;
  defaultValue?: string;
}) {
  const element = elementInstance as CustomInstance;
  const extraAtt = element.extraAttributes;

  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined
  );
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  return (
    <div className='flex flex-col w-full gap-2'>
      <Label className={cn(error && 'text-red-500')}>{extraAtt.label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              error && 'border-red-500'
            )}
          >
            <CalendarDays className='size-4 mr-2' />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto p-0'
          align='start'
        >
          <Calendar
            mode='single'
            selected={date}
            onSelect={date => {
              setDate(date);

              if (!submitValue) return;

              const value = date?.toUTCString() || '';
              const valid = DateFieldFormElement.validate(element, value);

              setError(!valid);
              submitValue(element.id, value);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <p
        className={cn(
          'text-xs px-1',
          error ? 'text-red-500' : 'text-muted-foreground'
        )}
      >
        {extraAtt.helperText ? extraAtt.helperText : null}
      </p>
    </div>
  );
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;
function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { helperText, label, required } = element.extraAttributes;

  const { updateElement } = useFormContext();
  const { register, handleSubmit, reset, setValue, getValues, watch } =
    useForm<propertiesFormSchemaType>({
      resolver: zodResolver(propertiesSchema),
      mode: 'onBlur',
      defaultValues: {
        label,
        helperText,
        required,
      },
    });

  useEffect(() => {
    reset(element.extraAttributes);
  }, [element, reset]);

  const applyChanges = (values: propertiesFormSchemaType) => {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...values,
      },
    });
  };

  return (
    <form
      onSubmit={e => e.preventDefault()}
      onBlur={handleSubmit(applyChanges)}
    >
      <div className='mb-2'>
        <Label htmlFor='label'>Label</Label>
        <Input
          id='label'
          className='mt-1'
          defaultValue={label}
          placeholder='Your label'
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          {...register('label')}
        />
        <p className='text-xs text-muted-foreground px-1 mt-1.5'>
          The label of the field. It will be display above the field.
        </p>
      </div>
      <div className='mb-2'>
        <Label htmlFor='helper-text'>Helper text</Label>
        <Input
          id='helper-text'
          className='mt-1'
          defaultValue={helperText}
          placeholder='Your helper text'
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          {...register('helperText')}
        />
        <p className='text-xs text-muted-foreground px-1 mt-1.5'>
          Extra indications you want to give the users. it will be display beloy
          the field.
        </p>
      </div>
      <div className='mb-2 flex flex-col gap-2 border border-border rounded-md mt-4 py-5 px-3'>
        <Label htmlFor='helper-text'>Required</Label>
        <div className='flex items-center'>
          <p className='text-xs text-muted-foreground pr-1'>
            Extra indications you want to give the users. it will be display
            beloy the field.
          </p>
          <Switch
            onClick={() => {
              setValue('required', !getValues('required'));
            }}
            checked={watch('required')}
          />
        </div>
      </div>
      <RemoveFieldBtn elementId={element.id} />
    </form>
  );
}
