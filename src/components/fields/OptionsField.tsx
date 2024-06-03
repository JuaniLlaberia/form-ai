'use client';

import { Plus, SquareMenu, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import RemoveFieldBtn from './(components)/RemoveFieldBtn';
import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from '@/app/dashboard/form/[formId]/edit/(components)/FormElements';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useFormContext } from '@/app/dashboard/form/[formId]/edit/(components)/FormContext';
import { Switch } from '../ui/switch';
import { Select, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';

const type: ElementsType = 'OptionsField';

const extraAttributes = {
  label: 'Options field',
  helperText: 'Helper text',
  required: false,
  placeholder: 'Select a value',
  options: ['New value'],
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(20),
  helperText: z.string().optional(),
  required: z.boolean().default(false),
  placeholder: z.string().min(2).max(40),
  options: z.array(z.string()).default([]),
});

export const OptionsFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  sidebarBtnElement: {
    icon: <SquareMenu />,
    label: 'Options field',
  },

  designComponent: DesignComponent,
  formComponent: () => <div>Form Component</div>,
  propertiesComponent: PropertiesComponent,
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
      <Select>
        <SelectTrigger disabled>
          <SelectValue placeholder={extraAtt.placeholder} />
        </SelectTrigger>
      </Select>
      <p className='text-xs text-muted-foreground px-1'>
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
  const { helperText, label, placeholder, required, options } =
    element.extraAttributes;

  const { updateElement } = useFormContext();
  const { register, handleSubmit, reset, setValue, getValues, watch } =
    useForm<propertiesFormSchemaType>({
      resolver: zodResolver(propertiesSchema),
      mode: 'onBlur',
      defaultValues: {
        label,
        helperText,
        placeholder,
        required,
        options,
      },
    });

  useEffect(() => {
    reset(element.extraAttributes);
  }, [element]);

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
        <Label htmlFor='placeholder'>Placeholder</Label>
        <Input
          id='placeholder'
          className='mt-1'
          defaultValue={placeholder}
          placeholder='Your placeholder'
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          {...register('placeholder')}
        />
        <p className='text-xs text-muted-foreground px-1 mt-1.5'>
          It helps the user know what information goes in this field.
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

      <div className='mb-2'>
        <div className='flex items-center justify-between my-4'>
          <Label>Options</Label>
          <Button
            size='sm'
            variant='outline'
            onClick={e => {
              e.preventDefault();
              const prevValues = getValues('options');
              setValue('options', [...prevValues, 'New value']);
            }}
          >
            Add <Plus className='size-4 ml-1.5' />
          </Button>
        </div>
        <ul className='flex flex-col gap-1.5 px-1'>
          {watch('options').map((op, i) => (
            <li
              key={i}
              className='flex items-center gap-1'
            >
              <Input
                placeholder='Options value...'
                defaultValue={op}
                type='text'
                // onChange={() => {
                //   const values = getValues('options');
                //   const newVals = values.slice(i, 1);
                //   setValue('options', newVals);
                // }}
              />
              <Button
                size='icon'
                variant='ghost'
                // onClick={() => {
                //   const values = getValues('options');
                //   const newVals = values.slice(i, 1);
                //   setValue('options', newVals);
                // }}
              >
                <X className='size-4' />
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className='mb-2 flex flex-col gap-2 border border-border rounded-md mt-4 py-5 px-3'>
        <Label htmlFor='helper-text'>Required</Label>
        <div className='flex items-center'>
          <p className='text-xs text-muted-foreground pr-1'>
            Extra indications you want to give the users. it will be display
            beloy the field.
          </p>
          <Switch />
        </div>
      </div>
      <RemoveFieldBtn elementId={element.id} />
    </form>
  );
}
