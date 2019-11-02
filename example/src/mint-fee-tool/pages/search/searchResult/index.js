/**
 * function: index
 * author  : wq
 * update  : 2019/5/23 16:15
 */
import { connect } from '@ddjf/ddepp/src/utils/epp-redux/index'
import { searchUpdate } from '@/mint-fee-tool/redux/actions'

const mapStateToData = state => ({
  search: state.search
})

const mapDispatchToPage = (dispatch, state) => ({
  setSearchWord: (search) => dispatch(searchUpdate(search))
})

Page(connect(mapStateToData, mapDispatchToPage)({
  data: {
    value: '美食',
    cardNo: '1234****',
    inputFocus: true,
    bank: '',
    name: ''
  },
  onPickerTap() {
    my.showActionSheet({
      title: '选择发卡银行',
      items: banks,
      success: (res) => {
        this.setData({
          bank: banks[res.index],
        });
      }
    })
  },
  handleInput() {
    dd.navigateTo({
      url: '/pages/step/1/index'
    })
  }
}))
