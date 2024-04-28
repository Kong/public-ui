import { metricFieldsSchema } from './MetricFields'

export const requestValidatorFormSchema = {
  'config-parameter_schema': {
    ...metricFieldsSchema,
    items: {
      type: 'object',
      default: () => ({
        required: false,
        explode: false,
      }),
      schema: {
        fields: [
          {
            model: 'in',
            label: 'in',
            type: 'select',
            values: ['query', 'header', 'path'],
          },
          {
            model: 'name',
            label: 'name',
            type: 'input',
            inputType: 'string',
            id: 'schema_name',
          },
          {
            model: 'required',
            label: 'required',
            type: 'switch',
            id: 'schema_required',
          },
          {
            model: 'style',
            label: 'style',
            type: 'select',
            values: [
              'label',
              'form',
              'matrix',
              'simple',
              'spaceDelimited',
              'pipeDelimited',
              'deepObject',
            ],
          },
          {
            model: 'explode',
            label: 'explode',
            type: 'switch',
            id: 'schema_explode',
          },
          {
            model: 'schema',
            label: 'schema',
            type: 'input',
            inputType: 'string',
            id: 'schema_schema',
          },
        ],
      },
    },
  },
}
