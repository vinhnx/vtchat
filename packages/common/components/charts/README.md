# Chart Components

Enhanced chart components with full-width layout and increased content padding.

## Area Chart Component

The `InteractiveAreaChart` component supports multiple series and stacking options, following the design from the provided recharts example.

### Features

- **Full width layout** with responsive design
- **Increased content padding** (px-8 py-8 for content, px-8 py-6 for headers)
- **Dashed grid lines** (strokeDasharray="3 3")
- **Monotone area curves** for smooth transitions
- **Multiple series support** (up to 3 series)
- **Stacking support** for cumulative data visualization
- **Customizable data keys** for flexible data mapping

### Usage

```typescript
import { ChartComponent, type ChartComponentData } from './chart-components';

// Single series area chart
const areaChartData: ChartComponentData = {
  type: 'areaChart',
  title: 'Simple Area Chart',
  data: [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    // ... more data
  ],
  xAxisLabel: 'Pages',
  yAxisLabel: 'Values',
  series1Name: 'Unique Visitors',
  dataKey1: 'uv',
};

// Multi-series area chart
const multiSeriesAreaChart: ChartComponentData = {
  type: 'areaChart',
  title: 'Multi-Series Area Chart',
  data: sampleData,
  series1Name: 'Unique Visitors',
  series2Name: 'Page Views',
  series3Name: 'Amount',
  dataKey1: 'uv',
  dataKey2: 'pv',
  dataKey3: 'amt',
};

// Stacked area chart
const stackedAreaChart: ChartComponentData = {
  type: 'areaChart',
  title: 'Stacked Area Chart',
  data: sampleData,
  series1Name: 'Series 1',
  series2Name: 'Series 2',
  dataKey1: 'uv',
  dataKey2: 'pv',
  stacked: true,
};

// Render the chart
<ChartComponent chartData={areaChartData} />
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `'areaChart'` | - | Chart type identifier |
| `title` | `string` | - | Chart title displayed in header |
| `data` | `any[]` | - | Array of data objects |
| `xAxisLabel` | `string` | - | Label for X-axis |
| `yAxisLabel` | `string` | - | Label for Y-axis |
| `series1Name` | `string` | `'Series 1'` | Name for first series |
| `series2Name` | `string` | - | Name for second series (optional) |
| `series3Name` | `string` | - | Name for third series (optional) |
| `dataKey1` | `string` | `'uv'` | Data key for first series |
| `dataKey2` | `string` | `'pv'` | Data key for second series |
| `dataKey3` | `string` | `'amt'` | Data key for third series |
| `stacked` | `boolean` | `false` | Enable stacking for cumulative visualization |

### Data Format

The area chart expects data in the following format:

```typescript
const data = [
  {
    name: 'Category A',  // Used for X-axis labels
    uv: 4000,           // First series value
    pv: 2400,           // Second series value (optional)
    amt: 2400,          // Third series value (optional)
  },
  // ... more data points
];
```

### Design Features

- **Responsive layout**: Uses `ResponsiveContainer` for full-width scaling
- **Consistent padding**: `px-8 py-8` for content areas, `px-8 py-6` for headers
- **Dashed grid**: `strokeDasharray="3 3"` for better visual separation
- **Smooth curves**: `type="monotone"` for natural area transitions
- **Color theming**: Uses CSS custom properties for consistent theming
- **Interactive tooltips**: Hover effects with detailed information
- **Conditional legend**: Shows legend only when multiple series are present

### Example Data

See `area-chart-example.tsx` for complete examples of:
- Single series area chart
- Multi-series area chart
- Stacked area chart

All chart components follow the same design system with consistent spacing, typography, and color schemes.
