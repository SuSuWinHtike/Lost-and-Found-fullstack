// Myanmar States, Regions, Cities and Townships
export const initialLocations = [
  {
    id: 'loc1',
    region: 'Yangon Region',
    cities: [
      {
        cityName: 'Yangon',
        townships: ['Kamayut', 'Bahan', 'Hledan', 'Dagon', 'Sanchaung', 'Yankin', 'Mayangone', 'Kyauktada']
      }
    ]
  },
  {
    id: 'loc2',
    region: 'Mandalay Region',
    cities: [
      {
        cityName: 'Mandalay',
        townships: ['Chanayethazan', 'Mahaaungmyay', 'Aungmyethazan', 'Pyigyidagun', 'Chanmyathazi']
      },
      {
        cityName: 'Pyin Oo Lwin',
        townships: ['Central Pyin Oo Lwin', 'Anisakan', 'Wetwun']
      }
    ]
  },
  {
    id: 'loc3',
    region: 'Naypyidaw Union Territory',
    cities: [
      {
        cityName: 'Naypyidaw',
        townships: ['Zabuthiri', 'Ottarathiri', 'Dekkhinathiri', 'Pyinmana', 'Lewe']
      }
    ]
  },
  {
    id: 'loc4',
    region: 'Shan State',
    cities: [
      {
        cityName: 'Taunggyi',
        townships: ['Taunggyi Central', 'Ayetharyar', 'Shwenyaung']
      },
      {
        cityName: 'Kalaw',
        townships: ['Kalaw Town', 'Aungban']
      }
    ]
  },
  {
    id: 'loc5',
    region: 'Bago Region',
    cities: [
      {
        cityName: 'Bago',
        townships: ['Bago City', 'Thanatpin', 'Kawa']
      }
    ]
  }
];

export const defaultStates = initialLocations.map(l => l.region);
