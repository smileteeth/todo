(function (window, Vue, undefined) {
	new Vue({
		el: "#app",
		data: {
			//数据不在使用本地数据，使用服务器存储window.localStorage，获取到的是数组形式的JSON字符串，使用JSON.parse转成数组
			dataList: JSON.parse(window.localStorage.getItem('dataList')) || [],
			newTodo: '',
			beforeUpdate: {},
			activeBtn: 1,
			showArr: []
		},
		methods: {
			//根据输入的内容添加到数组中，渲染在页面中
			addTodo () {
				if (!this.newTodo.trim()) {
					return
				}
				//将输入的数据添加在数组中
				this.dataList.push({
					content: this.newTodo.trim(), //将输入的数据添加在数组中
					isFinish: false,
					id: this.dataList.length ? this.dataList.sort((a, b) => a.id - b.id)[this.dataList.length - 1]['id'] + 1 : 1
				})
				this.newTodo = ''
			},
			
			//删除一条数据
			delTodo (index) {
				this.dataList.splice(index, 1)
			},
			//删除所有数据
			delAll () {
				this.dataList = this.dataList.filter(item => !item.isFinish)
			},
			//让当前的li添加editing类名，显示修改框 
			showEdit (index) {
				this.$refs.show.forEach(item => {
					item.classList.remove('editing')
				})
				this.$refs.show[index].classList.add('editing')
				this.beforeUpdate = JSON.parse(JSON.stringify(this.dataList[index]))
			},
			//双击编辑li内容
			updateTodo (index) {
				//如果内容为空删除这一项,使用$refs获取所有li，移除editing类名，当前的添加editing
				if (!this.dataList[index].content.trim()) return this.dataList.splice(index, 1)
				//如果当前内容改变了将isFinish改为false
				if (this.dataList[index].content !== this.beforeUpdate.content) this.dataList[index].isFinish = false
				this.$refs.show[index].classList.remove('editing')
				this.beforeUpdate = {}
			},
			//esc还原事件
			backTodo (index) {
				this.dataList[index].content = this.beforeUpdate.content
				this.$refs.show[index].classList.remove('editing')
				this.beforeUpdate = {}
			},
			//hashchange事件
			hashchange () {
				switch (window.location.hash) {
					case '':
					case '#/':
						this.showAll()
						this.activeBtn = 1
						break
					case '#/active':
						this.activeAll(false)
						this.activeBtn = 2
						break
					case '#/completed':
						this.activeAll(true)
						this.activeBtn = 3
						break
				}
			},
			//显示数组
			showAll () {  //使用map
				this.showArr = this.dataList.map(() => true)
			},
			//修改显示的数组
			activeAll (boo) {
				this.showArr = this.dataList.map(item => item.isFinish === boo)
				//判断是不是true
				if (this.dataList.every(item => item.isFinish === !boo)) return window.location.hash = '#/'
			}

		},
		//监听datalist数组的变化，此处使用watch方法监听新数据及老数据，还要使用深度监听deep:true
		watch: {
			dataList: {
				handler (newArr) {
					//将改变后的新数据添加存储在服务器
					window.localStorage.setItem('dataList', JSON.stringify(newArr))
					this.hashchange()
				},
				deep: true
			}
		},
		//自定义指令directives获取光标focus
		directives: {
			focus: {
				inserted (el) {
					el.focus()
				}
			}
		},
		//计算勾选中的个数，数据个数显示在页面中
		computed: {
			activeNum () {
				//filter()方法创建一个新的数组，新数组中的元素是通过检查指定数组中符合条件的所有元素
				return this.dataList.filter(item => !item.isFinish).length
			},

			toggleAll: {
				get () {
					//every 方法用于检测数组所有元素是否《都》符合指定条件 返回true或false
					//some	方法用于检测数组内元素是否有符合指定条件的元素，只要有一个就是true 所有都不符合返回false
					return this.dataList.every(item => item.isFinish)
				},

				set (val) {
					this.dataList.forEach(item => item.isFinish = val)
				}
			}
		},
		filters: {
			date (val) {
				return val + '  ---  ' + new Date().getDay()
			}
		},
		created () {
			this.hashchange()
			window.onhashchange = () => {
				this.hashchange()
			}
		}
	})

})(window, Vue);
