import Taro, { Component } from '@tarojs/taro'
import { View, Text, Picker } from '@tarojs/components'
import isEmpty from 'lodash/isEmpty'

import regionDataValue from './region'
import s from './index.module.scss'

type TaroRegionPickState = {
  regionDefault?: string
  region?: string
  range?: [[string], [string], [string]]
  value?: [number, number, number]
  onGetRegion: (region: any) => void
}

export default class TaroRegionPicker extends Component<TaroRegionPickState> {
  state = {
    region: '请选择省/市/区',
    range: [],
    value: [0, 0, 0]
  }
  private __regionData = regionDataValue
  
  componentDidMount(): void {
    const region = !isEmpty(this.props.regionDefault) ? this.props.regionDefault : this.state.region
    this.setState(
      { region },
      () => {
        if (!isEmpty(this.props.regionDefault)) this.handleRegionDataPro()
        if (isEmpty(this.props.regionDefault)) this.handleRegionDataInit()
      }
    )
  }
  
  // 省市区选择器定位
  handleRegionDataPro = () => {
    const regionData = JSON.parse(JSON.stringify(this.__regionData))
    const { region } = this.state
    const [province, city, county] = region.split('/')
    
    let provinceSelect: string[] = []
    let provinceIndex = 0
    regionData.forEach((item: {name: string}, index: number) => {
      if (province === item.name) {
        provinceIndex = index
      }
      provinceSelect = [...provinceSelect, item.name]
    })
    
    const citySelectArray = regionData[provinceIndex].city
    let citySelect: string[] = []
    let cityIndex = 0
    citySelectArray.forEach((item: {name: string; districtAndCounty: string[]}, index: number) => {
      if (city === item.name) {
        cityIndex = index
      }
      citySelect = [...citySelect, item.name]
    })
    
    const countySelect = citySelectArray[cityIndex].districtAndCounty
    let countyIndex = 0
    countySelect.forEach((item: string, index: number) => {
      if (county === item) {
        countyIndex = index
      }
    })
    
    const range = [provinceSelect, citySelect, countySelect]
    const value = [provinceIndex, cityIndex, countyIndex]
    
    this.setState({ range, value })
  }
  
  // 省市区选择器初始化
  handleRegionDataInit = () => {
    const regionData = JSON.parse(JSON.stringify(this.__regionData))
    let arrayProvince: string[] = []
    regionData.forEach((item: {name: string}) => {
      arrayProvince = [...arrayProvince, item.name]
    })
    
    const [first] = regionData
    const [, city] = Object.values(first)
    const [cityObject] = city
    const [cityName, county] = Object.values(cityObject)
    const range = [arrayProvince, [cityName], county]
    
    this.setState({ range })
  }
  
  onColumnChange = (e) => {
    const regionData = JSON.parse(JSON.stringify(this.__regionData))
    let { range, value }: any = this.state
    const { column, value: row } = e.detail
    
    value[column] = row
    switch (column) {
      case 0:
        let rangeCitySelect: string[] = []
        let rangeCountySelect: string[] = []
        const provinceSelect = regionData[row]
        const citySelect = provinceSelect.city
        const [countyFirst] = citySelect
        const countySelect = countyFirst.districtAndCounty
        
        citySelect.forEach(item => rangeCitySelect = [...rangeCitySelect, item.name])
        countySelect.forEach(item => rangeCountySelect = [...rangeCountySelect, item])
        value = [row, 0, 0]
        range = [range[0], rangeCitySelect, rangeCountySelect]
        break
      case 1:
        let rangeCounty: string[] = []
        const province = regionData[value[0]]
        const county = province.city[row].districtAndCounty
        county.forEach(item => rangeCounty = [...rangeCounty, item])
        value = [value[0], row, 0]
        range = [range[0], range[1], rangeCounty]
        break
      case 2:
        break
    }
    
    this.setState({ range, value })
  }
  
  onChange = (e) => {
    const { range: [firstRange, secondRange, thirdRange] } = this.state
    const { value: [firstValue, secondValue, thirdValue] } = e.detail
    
    const region = `${firstRange[firstValue]}/${secondRange[secondValue]}/${thirdRange[thirdValue]}`
    this.setState(
      { region },
      () => {
        this.props.onGetRegion(this.state.region)
      })
  }
  
  render() {
    const { region, range, value } = this.state
    const clazz = region === '请选择省市区' ? `${s.gray}` : `${s.black}`
    
    return (
      <View className={s.regionPickerComponent}>
        {/*// 使用多列选择器实现省市区选择器，支持H5、微信小程序、百度小程序、字节跳动小程序*/}
        {/*// PS：微信小程序、百度小程序、字节跳动小程序支持设置Picker的属性mode='region'实现省市区选择器，但本组件均采用多列选择器方式实现*/}
        <View className={`${s.regionPicker} ${clazz}`}>
          <Picker
            mode='multiSelector'
            onChange={this.onChange}
            onColumnChange={this.onColumnChange}
            range={range}
            value={value}
          >
            <View>
              <Text>{region}</Text>
            </View>
          </Picker>
        </View>
      </View>
    )
  }
}
