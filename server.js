//连接MongoDB数据库用的mongoose插件，跨域用的cors插件

const express = require('express')
//express引入进来之后是一个函数
//函数运行之后返回一个实例对象
const app = express()

//表示我们要允许express处理提交过来的json数据
app.use(express.json())



const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/express-test', { useUnifiedTopology: true,useNewUrlParser: true },   )
//假设现在有一个产品表,定义一个模型
//第一个参数是模型名称，第二个是表结构
const Product = mongoose.model('Product',new mongoose.Schema({
    title:String,
}))

//往数据库里面插入数据，注释了是因为只需要执行一次就行了
// Product.insertMany([
//     {title:'产品1'},
//     {title:'产品2'},
//     {title:'产品3'},
// ])

//一行代码解决跨域问题
app.use(require('cors')())


//用get方法去请求一个接口,表示用户请求我们的网站4000端口的根路径/的时候，我们做什么。
//req表示客户端请求过来的信息，res表示我们要响应的数据。

// app.get('/',function(req,res){
//     res.send(
//         {page:'home'}
//     )
// })


//express的静态文件托管
//传一个参数public，意思是所有public文件夹里面所有静态文件可以直接被访问。比如localhost:4000/index.html可以直接访问
//app.use(express.static('public'))
//若在加一个/static参数则必须要localhost:4000/static/index.html才能访问到，这样访问的逻辑就可控。
app.use(express.static('public'))

app.get('/about',function(req,res){
    res.send(
        {page:'About us'}
    )
})

/* 最开始的时候数据是写死的，后面是用数据库的 */
// app.get('/products',function(req,res){
//     res.send(
//         [
//             {id:1,title:'Product A'},
//             {id:2,title:'Product A'},
//             {id:3,title:'Product A'}
//         ]
//     )
// })

/* .find()表示查询所有数据  .find().limit(2)表示限制2条数据 
 .find().skip(1).limit(2)中skip跳过1条数据 所以skip和limit结合起来是做分页的
 .find().where({     where表示查询条件，是一个对象，表示什么字段为什么值
    title:'产品2'     查出来的结果只有产品2
 })
 .find().sort({_id:-1})    查询结果排序，-1表示倒序
 */

//函数里面用await，外面必须用async表示异步操作  （因为每一次查询都要连接数据库去异步查询，等待它返回结果）
app.get('/products',async function(req,res){
    res.send(
        await Product.find()
    )
})

//:id中的:表示任意字符，:后面被捕捉到的字符以id记录，id也可以改成name等属性名
//上面的接口.find()查询出来的结果是一个数组，而下例的查询详情页接口中.findById()查询的结果是一个对象
app.get('/products/:id',async function(req,res){
    //req.params表示客户端传递过来的url的所有参数  .id表示取出里面的id参数
    const data = await Product.findById(req.params.id)
    res.send(data)
})

//上面的get是客户端用来获取数据的，而提交数据一般用的是post
//新增数据
app.post('/products',async function(req,res){
    //req.body表示客户端发送过来的所有数据
    const data = req.body
    //把数据保存到MongoDB中,当在数据库中创建完后会返回一个对象
    const product = await Product.create(data)
    res.send(product)
})
//修改数据,用patch或put，用put的多一点（patch表示部分修改，put表示整个覆盖）
app.put('/products/:id',async function(req,res){
    //通过url里面的id找到要修改的这个产品
    const product = await Product.findById(req.params.id)//查询数据库要异步
    product.title = req.body.title  //这个赋值只是js中内存的操作不需要异步
    await product.save()   //保存到数据库要异步
    res.send(product)
})
//删除数据
app.delete('/products/:id',async function(req,res){
    const product = await Product.findById(req.params.id)
    await product.remove()
    res.send({
        success:true
    })
})





//去启动这个服务，监听电脑上的4000端口，当服务启动之后运行后面的箭头函数
app.listen(4000,() => {
    console.log("App is listening on port 4000!")
})

//express接口就是路由的意思
//一个主机名+一个端口号算一个域