// import {
//     Module



// } from "nodom";
class Count extends asd {
	model = {
		num: 0,
		AA:1,
		add:'aa'
	}
	methods = {
		add: function (dom, module) {
			this.num++;
		}
	}
	template() {
		return `
        <div e-change="num"  name={{num}} e-focus="add">
            <div>
            <div class="tip">单个if指令</div>
			<div x-if="show">hello</div>
			<div x-endif></div>
			<div class="code">
				<div class="introduce">
					如果discount<0.8
				</div>
				<div x-if="discount<0.8">价格：{{price}}</div>
				<div x-endif></div>
			</div> 
			<div class="tip">完整的if/else指令</div>
			<div class="code">
				<div class="introduce">
					 如果age<18，显示未成年，否则显示成年
					 </div>
				<div class="red" x-if="age<18">年龄：{{d}}，未成年</div>
				<div class="bold" x-else>年龄：{{age}}，成年</div>
				<div x-endif></div>
			</div>
			
			<div class="tip">if elseif </div>
			<div class="code">
				<div class="introduce">
					根据不同分数显示不同等级，<60不及格，60-69及格，70-79中等，80-89良好，>=90优秀
				</div>
				<div>成绩：{{grade}}</div>
				等级：
				<span x-if="grade<60">不及格</span>
				<span x-elseif="grade>=60 && grade<70"> 及格 </span>
				<span x-elseif="grade>=70 && grade<80"> 中等 </span>
				<span x-elseif="grade>=80 && grade<90"> 良好 </span>
				<span x-else> 优秀 </span>
				<span x-endif></span>
			</div> 
		<div e-mousemove="add" x-module="AA" ></div>
                <Nif/>
				{{{'name':aaa,ade:aada,'type':ass}}}
                <div e-change="add" x-class={{num{}}} ec="aaa">
                    <div x-class="num" e-click={{num}} e-click={{num}}></div>
				<div e-focus x-field="AA" aacc="aa"></div>
			</div>
            </div>
        </div>
      `
	}


}

function add() {
	console.log('aa');
}
let b = eval('(' + a + ')')
let c = new b()
console.log(c.model);