# Cost Configuration Guide

All construction cost values are stored in `/src/costs.json`. You can edit this file directly via terminal to update the costs throughout the dashboard.

## File Location
```
/Users/brandon/Repos/optimizerPrime/src/costs.json
```

## Editing Costs

### Via Terminal (nano)
```bash
nano src/costs.json
```
- Edit the values
- Press `Ctrl+O` to save
- Press `Ctrl+X` to exit

### Via Terminal (vim)
```bash
vim src/costs.json
```
- Press `i` to enter insert mode
- Edit the values
- Press `Esc` then type `:wq` to save and exit

### Via Terminal (VS Code)
```bash
code src/costs.json
```

## Cost Structure

### Demolition Components
Each demolition component has 5 levels (None, Minor, Moderate, Extreme, Complete):
- **demoFloor**: Flooring removal costs per sqft
- **demoWalls**: Wall removal/modification costs per sqft
- **demoCeiling**: Ceiling removal costs per sqft
- **demoLighting**: Light fixture removal costs per sqft
- **demoHVAC**: HVAC repair/replace costs per sqft
- **demoCasework**: Cabinet/millwork removal costs per sqft

### Interior Components
Each interior component has 4 levels (As-Is, Refresh, Upgrade, Alpha):
- **floors**: LVT, carpet, tile, transitions
- **walls**: Patch, paint, feature, framing
- **ceiling**: ACT, drywall, acoustics
- **lighting**: Fixtures, controls, daylighting
- **hvac**: Diffusers, VAVs, units, balancing
- **tech**: Data, AV, power, devices
- **millwork**: Storage, built-ins, counters
- **furniture**: Desks, chairs, tables, fixtures
- **appliances**: Ovens, refrigerators, dishwashers
- **labequip**: Lab equipment (benches, fume hoods, gas lines)

### Restroom Component
5 levels (As-Is, Demo+Basic, Demo+Alpha, Basic, Alpha)

### Exterior Component
4 levels (As-Is, Refresh, Upgrade, Alpha Spec)

## Example Edit

To change the cost of "Refresh" level flooring from $6/sqft to $8/sqft:

```json
{
  "key": "floors",
  "name": "Floors",
  "helper": "LVT, carpet, tile, transitions",
  "costs": [0, 8, 14, 24],  // Changed 6 to 8
  "appliesTo": "all"
}
```

## Hot Reload

After saving `costs.json`, Vite will automatically hot-reload the changes in the browser. No need to refresh manually.

## Cost Array Format

All cost arrays follow the pattern:
```json
"costs": [level0, level1, level2, level3, level4]
```

Where each number is the cost per square foot for that quality level.
