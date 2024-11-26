import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { NavigationMixin } from 'lightning/navigation'

import searchAccounts from '@salesforce/apex/AccountListAppController.searchAccounts'
import getAccountRecordTypes from '@salesforce/apex/AccountListAppController.getAccountRecordTypes'
import updateAccounts from '@salesforce/apex/AccountListAppController.updateAccounts'
import deleteAccounts from '@salesforce/apex/AccountListAppController.deleteAccount'

const columns = [
    {
        label: '取引先名',
        fieldName: 'nameUrl',
        type: 'button',
        typeAttributes: {
            label: {fieldName: 'Name'},
            name: 'view_details',
            variant: 'base'
        },
        editable: true
    },
    { label: '電話', fieldName: 'Phone', type: 'phone', editable: true },
    { label: 'Webサイト', fieldName: 'Website', type: 'url', editable: true }
]

export default class AccountListAppLwc extends NavigationMixin(LightningElement) {
    @track searchText = ''
    @track recordTypeId = ''
    @track industry = ''
    @track showSize = '5'
    @track accounts

    columns = columns

    @track showMessage = false
    // 初回訪問か判定
    checkFirstVisit() {
        const hasVisited = sessionStorage.getItem('hasVisited')

        if (!hasVisited) {
            this.showMessage = true
            sessionStorage.setItem('hasVisited', 'true')
        }
    }

    // 更新処理前の検索条件を保持
    lastSearchText = ''
    lastRecordTypeId = ''
    lastIndustry = ''
    lastShowSize = ''

    connectedCallback() {
        this.checkFirstVisit()

        this.loadRecordTypes()

        const lastSearchText = sessionStorage.getItem('searchText')
        const lastRecordTypeId = sessionStorage.getItem('recordTypeId')
        const lastIndustry = sessionStorage.getItem('industry')
        const lastShowSize = sessionStorage.getItem('showSize')

        if (lastSearchText === null || lastRecordTypeId === null || lastIndustry === null) {
            // Do Something
        } else {
            this.searchText = lastSearchText
            this.recordTypeId = lastRecordTypeId
            this.industry = lastIndustry
            this.showSize = lastShowSize

            this.lastHandleSearch(lastSearchText, lastRecordTypeId, lastIndustry)
        }

        this.updateDisplayList()
    }

    draftValues = []

    async handleSave(event) {
        const updatedFields = event.detail.draftValues

        this.draftValues = []

        try {
            await updateAccounts({ accountsForUpdate: updatedFields })

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Accounts updated',
                    variant: 'success'
                })
            )

            setTimeout(() => {
                location.reload()
                redirectUrl()
            }, 1000)
        } catch(error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while updating or refreshing records',
                    message: error.body.message,
                    variant: 'error',
                    mode: 'sticky'
                })
            )
        }
    }

    handleInputChange(event) {
        this.searchText = event.target.value
    }

    handleSearch() {
        this.showMessage = false

        this.lastSearchText = this.searchText
        this.lastRecordTypeId = this.recordTypeId
        this.lastIndustry = this.industry
        this.lastShowSize = this.showSize

        sessionStorage.setItem('searchText', this.lastSearchText)
        sessionStorage.setItem('recordTypeId', this.lastRecordTypeId)
        sessionStorage.setItem('industry', this.lastIndustry)
        sessionStorage.setItem('showSize', this.lastShowSize)

        searchAccounts({ searchText: this.searchText, recordTypeId: this.recordTypeId, industry: this.industry })
            .then(result => {
                this.accounts = result
                this.updateDisplayList()
            })
            .catch(error => {
                this.error = error
                this.accounts = undefined
            })
    }

    lastHandleSearch(lastSearchText, lastRecordTypeId, lastIndustry) {
        searchAccounts({ searchText: lastSearchText, recordTypeId: lastRecordTypeId, industry: lastIndustry })
            .then(result => {
                this.accounts = result
                this.updateDisplayList()
            })
            .catch(error => {
                this.error = error
                this.accounts = undefined
            })
    }

    @track recordTypeOptions

    loadRecordTypes() {
        getAccountRecordTypes()
            .then(result => {
                this.recordTypeOptions = [{ label: '全てのレコードタイプ', value: '' }]

                this.recordTypeOptions = this.recordTypeOptions.concat(result.map(rt => {
                    return { label: rt.Name, value: rt.Id }
                }))
            })
            .catch(error => {
                this.error = error
            })
    }

    handleRecordTypeChange(event) {
        this.recordTypeId = event.detail.value
    }

    industryOptions = [
        { label: 'すべての業種', value: '' },
        { label: 'Agriculture', value: 'Agriculture' },
        { label: 'Apparel', value: 'Apparel' },
        { label: 'Banking', value: 'Banking' }
    ]

    handleIndustryChange(event) {
        this.industry = event.detail.value
    }

    displayRecordOptions = [
        { label: '5', value: '5' },
        {label: '10', value: '10' },
        {label: '20', value: '20' },
        {label: '50', value: '50' },
        {label: '100', value: '100' }
    ]

    handleDisplayRecordChange(event) {
        this.showSize = event.detail.value
    }

    handleRowAction(event) {
        const row = event.detail.row

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                obectApiName: 'Account',
                actionName: 'view'
            }
        })
    }

    allItems = []

    page = 1

    startRecord = 1

    endRecord = 0

    totalPage = 0
    totalRecount = 0

    get isFirstPage() {
        return this.pagwe === 1
    }

    get isLastPage() {
        return this.page === this.totalPage
    }

    async updateDisplayList() {
        if (this.accounts.length === 0) {
            this.resultDisplay = false
            this.resultMessage = '検索結果：データが見つかりませんでした'
            this.accounts = null
            return
        }

        this.resultDisplay = true
        this.resultMessage = '検索結果：' + this.accounts.length + '件'

        this.allItems = this.accounts
        this.totalRecount = this.allItems.length

        this.totalPage = Math.ceil(this.totalRecount / this.showSize)

        this.accounts = this.allItems.slice(0, this.showSize)
        this.endRecord = this.showSize
    }

    previousHandler() {
        if (this.page > 1) {
            this.page -= 1
            this.pageChangeHandler(this.page)
        }
    }

    nextHandler() {
        if (this.page < this.totalPage) {
            this.page += 1
            this.pageChangeHandler(this.page)
        }
    }

    pageChangeHandler(page) {
        this.startRecord = ((page - 1) * this.showSize)
        this.endRecord = (page * this.showSize)

        if (this.endRecord > this.totalRecount) {
            this.endRecord = this.totalRecount
        }

        this.accounts = this.allItems.slice(this.startRecord, this.endRecord)
        this.startRecord += 1
    }

    @track isModalOpen = false

    handleSuccess() {
        this.closeModal()
        this.dispatchEvent(
            new ShowToastEvent({
                title: '成功',
                message: '取引先が正常に作成されました',
                variant: 'success'
            })
        )
    }

    handleError(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: '失敗',
                message: event.detail.message,
                variant: 'error'
            })
        )
    }

    seletedRows = []

    handleRowSelection(event) {
        const slectedRows = event.detail.selectedRows
        this.seletedRows = this.seletedRows
    }

    handleDelete() {
        if (this.seletedRows.length === 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: '削除するレコードを選択してください',
                    variant: 'error'
                })
            )
        } else {
            try {
                deleteAccounts({ accountsForDelete: this.selectedRows})

                setTimeout(() => {
                    location.reload()
                    redirectUrl()
                }, 1000);
            } catch(error) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'エラー発生',
                        message: error.body.message,
                        variant: 'error',
                        mode: 'sticky'
                    })
                )
            }
        }
    }

    get checkRecord() {
        return this.accounts === null ? true : false
    }

    convertArryaToCsv(downloadRecords) {
        let csvHeader = Object.keys(downloadRecords[0]).toString()
        console.log('header: ' + csvHeader)

        let csvBody = downloadRecords.map((currItem) => Object.values(currItem).toString())
        console.log('body: ' + csvBody)

        let csvFile = csvHeader + '\n' + csvBody.join('\n')

        return csvFile
    }

    createLinkForDownload(csvFile) {
        const downloadLink = document.createElement('a')

        downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvFile)
        downloadLink.target = '_blank'
        downloadLink.download = 'Account_Record_Data.csv'
        downloadLink.click()
    }

    handleExport() {
        let selectedRows = []
        let downloadRecords = []

        this.seletedRows = this.template.querySelector('lightning-datatable').getSeletecedRows()

        if (selectedRows > 0) {
            downloadRecords = [...selectedRows]
        } else {
            downloadRecords = [...this.accounts]
        }

        let csvFile = thsi.convertArryaToCsv(downloadRecords)
        this.createLinkForDownload(csvFile)
    }
}