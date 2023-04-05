'use strict';

class base_Class
{
    name = null;
    position = null;
    linkStr = null;
    constructor(nameStr, cssName) 
    {
        this.name = nameStr;
        //this.formatLinkStr(cssName, nameStr);
        this.linkStr = `<a href=# class=${ cssName } onclick = book.itemClick('${nameStr}') > ${ nameStr }</a >`;
    }

    buildLinkStrWithCount(css, objName, count)
    {
        this.linkStr = `<a href=# class=${css} onclick = book.itemClick('${objName}') >
            ${objName}<span class=count>(${count})</span></a>`;
    }


}
//私有变量
class book_class extends base_Class
{
    organArray = new Array();
    organMap = new Map();
    remedyMap = new Map();//<name, remedyArray> stores remedy positions pointing to itself.
    subRemedyMap = new Map();
    herbMap = new Map();
    leftListStr = null;
    leftListStrSorted = null;
    contentsStr = null;
    static css = "hh1";
    browseBackArray = new Array();
    browseForwardArray = new Array();
    #currentClickedOjbName = undefined;
    aboutStr = `<br><br>
				内容作者：张元素<br>
				朝代：金<br>
				GitHub：<br>
				版本：0.1beta<br>
				日期：2023.4.2
				辅助设计AI：New Bing(GPT4)<br>
                在下实在不会前端，好不容易才做成这样。本来想做的更好看，功能更多一些，无耐时间有限。`;

    constructor(text)
    {
        //this.bookText = text;
        let nameStr = text.substring(0, text.indexOf('\n')).trim()
        super(nameStr, book_class.css, nameStr);
        let splitedOrgans = text.split(/^[0-9]+\s/m);
        for (let i = 1; i < splitedOrgans.length; i++)
        {
            this.organArray.push(new organ_class(splitedOrgans[i]));
        }
        this.#parsePosition();
        this.buildLinkStrWithCount();
        this.#buildLeftList();
        this.#buildLeftListSorted();
        this.#buildContents();
    }
    ////统计项个数
    #parsePosition()
    {
        for (let organ of this.organArray)
        {
            this.#addPositionIntoMap(this.organMap, organ)
            for (let remedy of organ.remedyArray)
            {
                this.#addPositionIntoMap(this.remedyMap, remedy);
                for (let subRemedy of remedy.subRemedArray)
                {
                    this.#addPositionIntoMap(this.subRemedyMap, subRemedy);
                    for (let herb of subRemedy.herbArray)
                    {
                        this.#addPositionIntoMap(this.herbMap, herb);
                    }
                }
            }
        }
    }
    #addPositionIntoMap(map, obj)
    {
        let positionArray = map.get(obj.name);
        if (positionArray == undefined)
        {
            let newPositionArray = new Array();
            newPositionArray.push(obj);
            map.set(obj.name, newPositionArray);
        }
        else
        {
            positionArray.push(obj);
        }
    }
    buildLinkStrWithCount()
    {
        this.#buildLinkStrWithCountForClass(this.herbMap);
        this.#buildLinkStrWithCountForClass(this.subRemedyMap);
        this.#buildLinkStrWithCountForClass(this.remedyMap);
        for (let pair of this.subRemedyMap)
            for (let subRemedy of pair[1])
                subRemedy.buildAllAndPathStr();
    }
    #buildLinkStrWithCountForClass(map)
    {
        for (let pair of map)
        {
            for (let obj of pair[1])
            {
                obj.buildLinkStrWithCount(obj.constructor.css, obj.name, pair[1].length);
            }
        }
    }
    //处理左列表
    #buildLeftList()
    {
        this.leftListStr = "";
        this.#setLinkStr(this.organMap);
        this.#setLinkStr(this.remedyMap);
        this.#setLinkStr(this.subRemedyMap);
        this.#setLinkStr(this.herbMap);
    }
    #setLinkStr(map)
    {
        for (let pair of map)
        {
            let objArray = pair[1];
            this.leftListStr += objArray[0].linkStr + '<br>';
        }
    }
    #buildLeftListSorted()
    {
        this.leftListStrSorted = "";
        this.#setLinkStrSorted(this.organMap);
        this.#setLinkStrSorted(this.remedyMap);
        this.#setLinkStrSorted(this.subRemedyMap);
        this.#setLinkStrSorted(this.herbMap);
    }
    #setLinkStrSorted(map)
    {
        let objArray = Array.from(map);
        objArray.sort(function (a, b) { return b[1].length - a[1].length });
        for (let pair of objArray)
        {
            this.leftListStrSorted += pair[1][0].linkStr + '<br>';
        }
    }
    //处理目录
    #buildContents()
    {
        this.contentsStr = "";
        this.contentsStr += this.linkStr + '<span class="hh1">目录</span><br>';
        for (let organ of this.organArray)
        {
            this.contentsStr += organ.linkStr + '<br>';
            for (let remedy of organ.remedyArray)
            {
                this.contentsStr += '&nbsp;&nbsp;&nbsp;&nbsp;' + remedy.linkStr + '<br>';
                for (let subRemedy of remedy.subRemedArray)
                {
                    this.contentsStr += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
                        + subRemedy.linkStr + '<br>';
                }
            }
        }
    }
    //响应点击
    itemClick(objectName)
    {
        if (objectName != this.#currentClickedOjbName)
        {
            if (this.#currentClickedOjbName != undefined)
                this.browseBackArray.push(this.#currentClickedOjbName);
            this.#currentClickedOjbName = objectName;
            this.browseForwardArray = new Array();
            this.#showMainContent(this.#currentClickedOjbName);
        }
    }
    #showMainContent(objectName)
    {
        let str = "";
        switch (objectName)
        {
            case this.name:
                str = this.getShowString();
                break;
            case "contents":
                str = this.contentsStr;
                break;
            case "about":
                str = '<span class="hh2">&nbsp;&nbsp;&nbsp;&nbsp;关于</span><br>' + this.aboutStr;
                break;
            default:
                let objArray = this.#getItem(objectName);
                str = `<span class="hh2">&nbsp;&nbsp;&nbsp;&nbsp;${objArray[0].name}</span>
                <span class=count>&nbsp;&nbsp;${objArray.length}</span><br>`;
                for (let obj of objArray)
                    str += obj.getShowString();
        }
        document.getElementById("mainContent").innerHTML = str;
    }
    #getItem(objectName)
    {
        let obj = this.herbMap.get(objectName);
        if (obj != undefined)
            return (obj);
        obj = this.subRemedyMap.get(objectName);
        if (obj != undefined)
            return (obj);
        obj = this.remedyMap.get(objectName);
        if (obj != undefined)
            return (obj);
        obj = this.organMap.get(objectName);
        return (obj);
    }
    getShowString()
    {
        let showString = this.linkStr + '<br>';
        for (let organ of this.organArray)
        {
            showString += organ.getShowString() + '<br>';
        }
        return (showString);
    }
    //显示左列表
    showLeftList()
    {
        if (!document.getElementById("checkbox_sort").checked)
            document.getElementById("leftList").innerHTML = book.leftListStr;
        else
            document.getElementById("leftList").innerHTML = book.leftListStrSorted;
    }

    back()
    {
        let objName = this.browseBackArray.pop();
        if (objName != undefined)
        {
            this.browseForwardArray.push(this.#currentClickedOjbName);
            this.#currentClickedOjbName = objName;
            this.#showMainContent(this.#currentClickedOjbName);
        }
    }
    forward()
    {
        let objName = this.browseForwardArray.pop();
        if (objName != undefined)
        {
            this.browseBackArray.push(this.#currentClickedOjbName);
            this.#currentClickedOjbName = objName;
            this.#showMainContent(this.#currentClickedOjbName);
        }
    }
}

 //定义一个脏器类
class organ_class extends base_Class
{
    description = null;
    //position = null;
    remedyArray = new Array();
    static css = "organ";

    // 构造函数
    constructor(splitedOrignalText)
    {
        //this.organText = splitedOrignalText;
        let nameStr = splitedOrignalText.substring(0, splitedOrignalText.indexOf('\n')).trim();
        super(nameStr, organ_class.css, nameStr);
        let splitedRemedies = splitedOrignalText.split(/^[0-9]+.[0-9]+\s/m);
        let desp = splitedRemedies[0].substring(splitedOrignalText.indexOf('\n') + 1).trim();
        this.description = desp.replaceAll('\n', '<br>');
        this.position = new position_class(this);
        for (let i = 1; i < splitedRemedies.length; i++)
        {
            this.remedyArray.push(new remedy_class(splitedRemedies[i], this));
        }
    }

    getShowString()
    {
        let showString = this.linkStr + '<br>&nbsp;&nbsp;&nbsp;&nbsp;' + this.description + '<br>';
        for (let remedy of this.remedyArray)
        {
            showString += '&nbsp;&nbsp;&nbsp;&nbsp;' + remedy.linkStr + '<br>';
            for (let subRemedy of remedy.subRemedArray)
            {
                showString += subRemedy.allStr;
            }
        }
        return (showString);
    }
}

class remedy_class extends base_Class
{
    //position = null;
    subRemedArray = new Array();
    static css = "remedy";
    constructor(splitedRemedyText, organ)
    {
        //this.remedyText = splitedRemedyText;
        let splitedSubRemedies = splitedRemedyText.split(/^[0-9]+.[0-9]+.[0-9]+\s/m);
        let nameStr = splitedSubRemedies[0].substring(0, splitedSubRemedies[0].indexOf('\n')).trim();
        super(nameStr, remedy_class.css, nameStr);
        this.position = new position_class(organ, this);
        for (let i = 1; i < splitedSubRemedies.length; i++)
        {
            this.subRemedArray.push(new subRemedy_class(splitedSubRemedies[i], this));
        }
    }

    getShowString()
    {
        let showString = this.position.organ.linkStr + '<br>'
            + '&nbsp;&nbsp;&nbsp;&nbsp;' + this.linkStr + '<br>';
        for (let subRemedy of this.subRemedArray)
        {
            showString += subRemedy.allStr;
        }
        return (showString);
    }

}

class subRemedy_class extends base_Class
{
    herbArray = new Array();
    static css = "subRemedy";
    allStr = null;
    pathStr = null;

    constructor(splitedSubRemedyText, remedy)
    {
        let nameStr = splitedSubRemedyText.substring(0, splitedSubRemedyText.indexOf('\n'));
        super(nameStr, subRemedy_class.css, nameStr);
        this.position = new position_class(remedy.position.organ, remedy, this);
        let herbText = splitedSubRemedyText.substring(splitedSubRemedyText.indexOf('\n') + 1).trim();
        let herbs = herbText.split(/\s+/);
        for (let herb of herbs)
        {
            this.herbArray.push(new herb_class(herb, this));
        }
    }

    buildAllAndPathStr()
    {
        this.allStr = '&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;' + this.linkStr
            + '<br>&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
        for (let herb of this.herbArray)
        {
            this.allStr += herb.linkStr + '&nbsp;';
        }
        this.allStr += '<br>';
        this.pathStr = this.position.organ.linkStr + '<br>'
            + '&nbsp;&nbsp;&nbsp;&nbsp;' + this.position.remedy.linkStr + '<br>';
    }

    getShowString()
    {
        return (this.pathStr + this.allStr);
    }
}

class herb_class extends base_Class
{
    static css = "herb";
    constructor(herbName, subRemedy)
    {
        super(herbName, herb_class.css, herbName);
        this.position
            = new position_class(subRemedy.position.organ, subRemedy.position.remedy, subRemedy, this);
    }

    getShowString()
    {
        return (this.position.subRemedy.getShowString());
    }

}


class position_class
{
    organ = null;
    remedy = null;
    subRemedy = null;
    herb = null;
    constructor(org, remd, subRme, herbStr)
    {
        this.organ = org;
        this.remedy = remd;
        this.subRemedy = subRme;
        this.herb = herbStr;
    }
}

var originalText = `《脏腑标本虚实寒热用药式》
1 肝
　　肝 藏魂，属木。胆火寄于中。主血，主目，主筋，主呼，主怒。
　　本病：诸风眩晕，僵仆强直，惊痫，两胁肿痛，胸肋满痛，呕血，小腹疝痛 瘕，女人经病。
　　标病：寒热疟，头痛吐涎，目赤面青，多怒，耳闭颊肿，筋挛卵缩，丈夫 疝，女人少腹肿痛、阴病。
1.1 有馀泻之
1.1.1 泻子
　　甘草
1.1.2 行气
　　香附 芎 瞿麦 牵牛 青橘皮
1.1.3 行血
　　红花 鳖甲 桃仁 莪术 京三棱 穿山甲 大黄 水蛭 虻虫 苏木 牡丹皮
1.1.4 镇惊
　　雄黄 金箔 铁落 真珠 代赭石 夜明砂 胡粉 银箔 铅丹 龙骨 石决明
1.1.5 搜风
　　羌活 荆芥 薄荷 槐子 蔓荆子 白花蛇 独活 防风 皂荚 乌头 白附子 僵蚕 蝉蜕
1.2 不足补之
1.2.1 补母
　　枸杞 杜仲 狗脊 熟地黄 苦参 萆 阿胶 菟丝子
1.2.2 补血
　　当归 牛膝 续断 白芍药 血竭 没药 芎
1.2.3 补气
　　天麻 柏子仁 白术 菊花 细辛 密蒙花 决明 谷精草 生姜
1.3 本热寒之
1.3.1 泻木
　　芍药 乌梅 泽泻
1.3.2 泻火
　　黄连 龙胆草 黄芩 苦茶 猪胆
1.3.3 攻里
　　大黄
1.4 标热发之
1.4.1 和解
　　柴胡 半夏
1.4.2 解肌
　　桂枝 麻黄
2 心
　　心 藏神，为君火。包络为相火，代君行令。主血，主言，主汗，主笑。
　　本病：诸热瞀螈，惊惑谵妄烦乱，啼笑骂詈，怔忡健忘，自汗，诸痛痒疮疡。
　　标病：肌热畏寒战栗，舌不能言，面赤目黄，手心烦热，胸胁满痛，引腰背、肩胛、肘臂。
2.1 火实泻之
2.1.1 泻子
　　黄连 大黄
2.1.2 气
　　甘草 人参 赤茯苓 木通 黄柏
2.1.3 血
　　丹参 牡丹 生地黄 玄参
2.1.4 镇惊
　　朱砂 牛黄 紫石英
2.2 神虚补之
2.2.1 补母
　　细辛 乌梅 酸枣仁 生姜 陈皮
2.2.2 气
　　桂心 泽泻 白茯苓 茯神 远志 石菖蒲
2.2.3 血
　　当归 乳香 熟地黄 没药
2.3 本热寒之
2.3.1 泻火
　　黄芩 竹叶 麦门冬 芒硝 炒盐
2.3.2 凉血
　　地黄 栀子 天竺黄
2.4 标热发之
2.4.1 散火
　　甘草 独活 麻黄 柴胡 龙脑
3 脾
　　脾 藏意，属土，为万物之母。主营卫，主味，主肌肉，主四肢。
　　本病：诸湿肿胀，痞满噫气，大小便闭，黄胆痰饮，吐泻霍乱，心腹痛，饮食不化。
　　标病：身体 肿，重困嗜卧，四肢不举，舌本强痛，足大趾不用，九窍不通，诸痉项强。
3.1 土实泻之
3.1.1 泻子
　　诃子 防风 桑白皮 葶苈
3.1.2 吐
　　豆豉 栀子 萝卜子 常山 瓜蒂 郁金 齑汁 藜芦 苦参 赤小豆 盐汤 苦茶
3.1.3 下
　　大黄 芒硝 青礞石 大戟 甘遂 续随子 芫花
3.2 土虚补之
3.2.1 补母
　　桂心 茯苓
3.2.2 气
　　人参 黄 升麻 葛根 甘草 陈橘皮 藿香 葳蕤 缩砂仁 木香 扁豆
3.2.3 血
　　白术 苍术 白芍药 胶饴 大枣 乾姜 木瓜 乌梅 蜂蜜
3.3 本湿除之
3.3.1 燥中宫
　　白术 苍术 橘皮 半夏 吴茱萸 南星 草豆蔻 白芥子
3.3.2 洁净府
　　木通 赤茯苓 猪苓 藿香
3.4 标湿渗之
3.4.1 开鬼门
　　葛根 苍术 麻黄 独活
4 肺
　　肺 藏魄，属金，总摄一身元气。主闻，主哭，主皮毛。
　　本病：诸气 郁，诸痿喘呕，气短，咳嗽上逆，咳唾脓血，不得卧，小 不禁。
　　标病：洒淅寒热，伤风自汗，肩背痛冷， 臂前廉痛。
4.1 气实泻之
4.1.1 泻子
　　泽泻 葶苈 桑白皮 地骨皮
4.1.2 除湿
　　半夏 白矾 白茯苓 薏苡仁 木瓜 橘皮
4.1.3 泻火
　　粳米 石膏 寒水石 知母 诃子
4.1.4 通滞
　　枳壳 薄荷 干生姜 木香 浓朴 杏仁 皂荚 桔梗 紫苏梗
4.2 气虚补之
4.2.1 补母
　　甘草 人参 升麻 黄 山药
4.2.2 润燥
　　蛤蚧 阿胶 麦门冬 贝母 百合 天花粉 天门冬
4.2.3 敛肺
　　乌梅 粟壳 五味子 芍药 五倍子
4.3 本热清之
4.3.1 清金
　　黄芩 知母 麦门冬 栀子 沙参 紫菀 天门冬
4.4 本寒温之
4.4.1 温肺
　　丁香 藿香 款冬花 檀香 白豆蔻 益智 缩砂 糯米 百部
4.5 标寒散之
4.5.1 解表
　　麻黄 葱白 紫苏
5 肾
　　肾 藏志，属水，为天一之源。主听，主骨，主二阴。
　　本病：诸寒厥逆，骨痿腰痛，腰冷如冰，足 肿寒，少腹满急疝瘕，大便闭泄，吐利腥秽
　　标病：发热不恶热，头眩头痛，咽痛舌燥，脊股后廉痛。
5.1 水强泻之
5.1.1 泻子
　　大戟 牵牛
5.1.2 泻腑
　　泽泻 猪苓 车前子 防己 茯苓
5.2 水弱补之
5.2.1 补母
　　人参 山药
5.2.2 气
　　知母 玄参 补骨脂 砂仁 苦参
5.2.3 血
　　黄柏 枸杞 熟地黄 锁阳 肉苁蓉 山茱萸 阿胶 五味子
5.3 本热攻之
5.3.1 下
　　大承气汤。伤寒少阴证，口燥咽乾。
5.4 本寒温之
5.4.1 温里
　　附子 乾姜 官桂 蜀椒 白术
5.5 标寒解之
5.5.1 解表
　　麻黄 细辛 独活 桂枝
5.6 标热凉之
5.6.1 清热
　　玄参 连翘 甘草 猪肤
6 命门
　　命门 为相火之原，天地之始，藏精生血，降则为漏，升则为铅，主三焦元气。
　　本病：前后癃闭，气逆里急，疝痛奔豚，消渴膏淋，精漏精寒，赤白浊，溺血，崩中带漏。
6.1 火强泻之
6.1.1 泻相火
　　黄柏 知母 牡丹皮 地骨皮 生地黄 茯苓 玄参 寒水石
6.2 火弱补之
6.2.1 益阳
　　附子 肉桂 益智子 破故纸 沉香 川乌头 硫黄 天雄 乌药 阳起石 角回香 胡桃 巴戟天 丹砂 当归 蛤蚧 覆盆
6.3 精脱固之
6.3.1 涩滑
　　牡蛎 芡实 金樱子 五味子 远志 山茱萸 蛤粉
7 三焦
　　三焦 为相火之用，分布命门元气，主升降出入，游行天地之间，总领五脏六腑营卫经络内外上下左右之气，号中清之府。上主纳，中主化，下主出。
　　本病：诸热瞀螈，暴病暴死暴喑，躁扰狂越，谵妄惊骇，诸血溢血泄，诸气逆冲上，诸疮疡痘疹瘤核。
　　上热则喘满，诸呕吐酸，胸痞胁痛，食饮不消，头上出汗。
　　中热则善饥而瘦，解 中满，诸胀腹大，诸病有声，鼓之如鼓，上下关格不通，霍乱吐利。
　　下热则暴注下迫，水液混浊，下部肿满，小便淋沥或不通，大便闭结下痢。
　　上寒则吐 饮食痰水，胸痹，前后引痛，食已还出。
　　中寒则饮食不化，寒胀，反胃吐水，湿泻不渴。
　　下寒则二便不禁，脐腹冷，疝痛。
　　标病：恶寒战栗，如丧神守，耳鸣耳聋，嗌肿喉痹，诸病 肿不用。
7.1 实火泻之
7.1.1 汗
　　麻黄 柴胡 葛根 荆芥 升麻 薄荷 羌活 石膏
7.1.2 吐
　　瓜蒂 沧盐 齑汁
7.1.3 下
　　大黄 芒硝
7.2 虚火补之
7.2.1 上
　　人参 天雄 桂心
7.2.2 中
　　人参 黄 丁香 木香 草果
7.2.3 下
　　附子 桂心 硫黄 人参 沉香 乌药 破故纸
7.3 本热寒之
7.3.1 上
　　黄芩 连翘 栀子 知母 玄参 石膏 生地黄
7.3.2 中
　　黄连 连翘 生地 石膏
7.3.3 下
　　黄柏 知母 生地 石膏 牡丹 地骨皮
7.4 标热散之
7.4.1 解表
　　柴胡 细辛 荆芥 羌活 葛根 石膏
8 胆
　　胆 属木，为少阳相火，发生万物，为决断之官，十一脏之主 主同肝。
　　本病：口苦，呕苦汁，善太息，澹澹如人将捕状，目昏不眠。
　　标病：寒热往来， 疟，胸胁痛，头额痛，耳痛鸣聋，瘰 结核
8.1 实火泻之
8.1.1 泻胆
　　龙胆 牛膝 猪胆 生蕤仁 生酸枣仁 黄连 苦茶
8.2 虚火补之
8.2.1 温胆
　　人参 细辛 半夏 炒蕤仁 炒酸枣仁 当归 地黄
8.3 本热平之
8.3.1 降火
　　黄芩 黄连 芍药 连翘 甘草
8.3.2 镇惊
　　黑铅 水银
8.4 标热和之
8.4.1 和解
　　柴胡 芍药 黄芩 半夏 甘草
9 胃
　　胃 属土，主容受，为水谷之海。主同脾。
　　本病：噎膈反胃，中满肿胀，呕吐泻痢，霍乱腹痛，消中善饥，不消食，伤饮食，胃管当心痛，支两胁。
　　标病：发热蒸蒸，身前热，身前寒，发狂谵语，咽痹，上齿痛，口眼 斜，鼻痛鼽衄赤。
9.1 胃实泻之
9.1.1 湿热
　　大黄 芒硝
9.1.2 饮食
　　巴豆 神曲 山楂 阿魏 砂 郁金 三棱 轻粉
9.2 胃虚补之
9.2.1 湿热
　　苍术 白术 半夏 茯苓 橘皮 生姜
9.2.2 寒湿
　　乾姜 附子 草果 官桂 丁香 肉豆蔻 人参 黄
9.3 本热寒之
9.3.1 降火
　　石膏 地黄 犀角 黄连
9.4 标热解之
9.4.1 解肌
　　升麻 葛根 豆豉
10 大肠
　　大肠 属金，主变化，为传送之官。
　　本病：大便闭结，泄痢下血，里急后重，疽痔脱肛，肠鸣而痛。
　　标病：齿痛喉痹，颈肿口乾，咽中如核，鼽衄目黄，手大指次指痛，宿食发热寒栗。
10.1 肠实泻之
10.1.1 热
　　大黄 芒硝 桃花 牵牛 巴豆 郁李仁 石膏
10.1.2 气
　　枳壳 木香 橘皮 槟榔
10.2 肠虚补之
10.2.1 气
　　皂荚
10.2.2 燥
　　桃仁 麻仁 杏仁 地黄 乳香 松子 当归 肉苁蓉
10.2.3 湿
　　白术 苍术 半夏 硫磺
10.2.4 陷
　　升麻 葛根
10.2.5 脱
　　龙骨 白垩 诃子 粟壳 乌梅 白矾 赤石脂 禹馀粮 石榴皮
10.3 本热寒之
10.3.1 清热
　　秦艽 槐角 地黄 黄芩
10.4 本寒温之
10.4.1 温里
　　乾姜 附子 肉豆蔻
10.5 标热散之
10.5.1 解肌
　　石膏 白芷 升麻 葛根
11 小肠
　　小肠 主分泌水谷，为受盛之官。
　　本病：大便水谷利，小便短，小便闭，小便血，小便自利，大便后血，小肠气痛，宿食 夜热旦止。
　　标病：身热恶寒，嗌痛颔肿，口糜耳聋。
11.1 实热泻之
11.1.1 气
　　木通 猪苓 滑石 瞿麦 泽泻 灯草
11.1.2 血
　　地黄 蒲黄 赤茯苓 栀子 牡丹皮
11.2 虚寒补之
11.2.1 气
　　白术 楝实 茴香 砂仁 神曲 扁豆
11.2.2 血
　　桂心 延胡索
11.3 本热寒之
11.3.1 降火
　　黄柏 黄芩 黄连 连翘 栀子
11.4 标热散之
11.4.1 解肌
　　本 羌活 防风 蔓荆
12 膀胱
　　膀胱 主津液，为胞之府，气化乃能出，号州都之官，诸病皆乾之。
　　本病：小便淋沥，或短数，或黄赤，或白，或遗失，或气痛。
　　标病：发热恶寒，头痛，腰脊强，鼻窒，足小指不用。
12.1 实热泻之
12.1.1 泄火
　　滑石 猪苓 泽泻 茯苓
12.2 下虚补之
12.2.1 热
　　黄柏 知母
12.2.2 寒
　　桔梗 升麻 益智 乌药 山茱萸
12.3 本热利之
12.3.1 降火
　　地黄 栀子 茵陈 黄柏 牡丹皮 地骨皮
12.4 标寒发之
12.4.1 发表
　　麻黄 桂枝 羌活 苍术 防己 黄 木贼`;
var originalTextTC = `《臟腑標本虛實寒熱用藥式》
1 肝
　　肝 藏魂，屬木。膽火寄於中。主血，主目，主筋，主呼，主怒。
　　本病：諸風眩暈，僵僕強直，驚癇，兩脅腫痛，胸肋滿痛，嘔血，小腹疝痛 瘕，女人經病。
　　標病：寒熱瘧，頭痛吐涎，目赤面青，多怒，耳閉頰腫，筋攣卵縮，丈夫 疝，女人少腹腫痛、陰病。
1.1 有餘瀉之
1.1.1 瀉子
　　甘草
1.1.2 行氣
　　香附 芎 瞿麥 牽牛 青橘皮
1.1.3 行血
　　紅花 鱉甲 桃仁 莪術 京三棱 穿山甲 大黃 水蛭 虻蟲 蘇木 牡丹皮
1.1.4 鎮驚
　　雄黃 金箔 鐵落 真珠 代赭石 夜明砂 胡粉 銀箔 鉛丹 龍骨 石決明
1.1.5 搜風
　　羌活 荊芥 薄荷 槐子 蔓荊子 白花蛇 獨活 防風 皂莢 烏頭 白附子 僵蠶 蟬蛻
1.2 不足補之
1.2.1 補母
　　枸杞 杜仲 狗脊 熟地黃 苦參 萆 阿膠 菟絲子
1.2.2 補血
　　當歸 牛膝 續斷 白芍藥 血竭 沒藥 芎
1.2.3 補氣
　　天麻 柏子仁 白術 菊花 細辛 密蒙花 決明 穀精草 生薑
1.3 本熱寒之
1.3.1 瀉木
　　芍藥 烏梅 澤瀉
1.3.2 瀉火
　　黃連 龍膽草 黃芩 苦茶 豬膽
1.3.3 攻裡
　　大黃
1.4 標熱發之
1.4.1 和解
　　柴胡 半夏
1.4.2 解肌
　　桂枝 麻黃
2 心
　　心 藏神，為君火。包絡為相火，代君行令。主血，主言，主汗，主笑。
　　本病：諸熱瞀螈，驚惑譫妄煩亂，啼笑駡詈，怔忡健忘，自汗，諸痛癢瘡瘍。
　　標病：肌熱畏寒戰慄，舌不能言，面赤目黃，手心煩熱，胸脅滿痛，引腰背、肩胛、肘臂。
2.1 火實瀉之
2.1.1 瀉子
　　黃連 大黃
2.1.2 氣
　　甘草 人參 赤茯苓 木通 黃柏
2.1.3 血
　　丹參 牡丹 生地黃 玄參
2.1.4 鎮驚
　　朱砂 牛黃 紫石英
2.2 神虛補之
2.2.1 補母
　　細辛 烏梅 酸棗仁 生薑 陳皮
2.2.2 氣
　　桂心 澤瀉 白茯苓 茯神 遠志 石菖蒲
2.2.3 血
　　當歸 乳香 熟地黃 沒藥
2.3 本熱寒之
2.3.1 瀉火
　　黃芩 竹葉 麥門冬 芒硝 炒鹽
2.3.2 涼血
　　地黃 梔子 天竺黃
2.4 標熱發之
2.4.1 散火
　　甘草 獨活 麻黃 柴胡 龍腦
3 脾
　　脾 藏意，屬土，為萬物之母。主營衛，主味，主肌肉，主四肢。
　　本病：諸濕腫脹，痞滿噫氣，大小便閉，黃膽痰飲，吐瀉霍亂，心腹痛，飲食不化。
　　標病：身體 腫，重困嗜臥，四肢不舉，舌本強痛，足大趾不用，九竅不通，諸痙項強。
3.1 土實瀉之
3.1.1 瀉子
　　訶子 防風 桑白皮 葶藶
3.1.2 吐
　　豆豉 梔子 蘿蔔子 常山 瓜蒂 郁金 齏汁 藜蘆 苦參 赤小豆 鹽湯 苦茶
3.1.3 下
　　大黃 芒硝 青礞石 大戟 甘遂 續隨子 芫花
3.2 土虛補之
3.2.1 補母
　　桂心 茯苓
3.2.2 氣
　　人參 黃 升麻 葛根 甘草 陳橘皮 藿香 葳蕤 縮砂仁 木香 扁豆
3.2.3 血
　　白術 蒼術 白芍藥 膠飴 大棗 乾薑 木瓜 烏梅 蜂蜜
3.3 本濕除之
3.3.1 燥中宮
　　白術 蒼術 橘皮 半夏 吳茱萸 南星 草豆蔻 白芥子
3.3.2 潔淨府
　　木通 赤茯苓 豬苓 藿香
3.4 標濕滲之
3.4.1 開鬼門
　　葛根 蒼術 麻黃 獨活
4 肺
　　肺 藏魄，屬金，總攝一身元氣。主聞，主哭，主皮毛。
　　本病：諸氣 郁，諸痿喘嘔，氣短，咳嗽上逆，咳唾膿血，不得臥，小 不禁。
　　標病：灑淅寒熱，傷風自汗，肩背痛冷， 臂前廉痛。
4.1 氣實瀉之
4.1.1 瀉子
　　澤瀉 葶藶 桑白皮 地骨皮
4.1.2 除濕
　　半夏 白礬 白茯苓 薏苡仁 木瓜 橘皮
4.1.3 瀉火
　　粳米 石膏 寒水石 知母 訶子
4.1.4 通滯
　　枳殼 薄荷 幹生薑 木香 濃樸 杏仁 皂莢 桔梗 紫蘇梗
4.2 氣虛補之
4.2.1 補母
　　甘草 人參 升麻 黃 山藥
4.2.2 潤燥
　　蛤蚧 阿膠 麥門冬 貝母 百合 天花粉 天門冬
4.2.3 斂肺
　　烏梅 粟殼 五味子 芍藥 五倍子
4.3 本熱清之
4.3.1 清金
　　黃芩 知母 麥門冬 梔子 沙參 紫菀 天門冬
4.4 本寒溫之
4.4.1 溫肺
　　丁香 藿香 款冬花 檀香 白豆蔻 益智 縮砂 糯米 百部
4.5 標寒散之
4.5.1 解表
　　麻黃 蔥白 紫蘇
5 腎
　　腎 藏志，屬水，為天一之源。主聽，主骨，主二陰。
　　本病：諸寒厥逆，骨痿腰痛，腰冷如冰，足 腫寒，少腹滿急疝瘕，大便閉泄，吐利腥穢
　　標病：發熱不惡熱，頭眩頭痛，咽痛舌燥，脊股後廉痛。
5.1 水強瀉之
5.1.1 瀉子
　　大戟 牽牛
5.1.2 瀉腑
　　澤瀉 豬苓 車前子 防己 茯苓
5.2 水弱補之
5.2.1 補母
　　人參 山藥
5.2.2 氣
　　知母 玄參 補骨脂 砂仁 苦參
5.2.3 血
　　黃柏 枸杞 熟地黃 鎖陽 肉蓯蓉 山茱萸 阿膠 五味子
5.3 本熱攻之
5.3.1 下
　　大承氣湯。傷寒少陰證，口燥咽乾。
5.4 本寒溫之
5.4.1 溫裡
　　附子 乾姜 官桂 蜀椒 白術
5.5 標寒解之
5.5.1 解表
　　麻黃 細辛 獨活 桂枝
5.6 標熱涼之
5.6.1 清熱
　　玄參 連翹 甘草 豬膚
6 命門
　　命門 為相火之原，天地之始，藏精生血，降則為漏，升則為鉛，主三焦元氣。
　　本病：前後癃閉，氣逆裡急，疝痛奔豚，消渴膏淋，精漏精寒，赤白濁，溺血，崩中帶漏。
6.1 火強瀉之
6.1.1 瀉相火
　　黃柏 知母 牡丹皮 地骨皮 生地黃 茯苓 玄參 寒水石
6.2 火弱補之
6.2.1 益陽
　　附子 肉桂 益智子 破故紙 沉香 川烏頭 硫黃 天雄 烏藥 陽起石 角回香 胡桃 巴戟天 丹砂 當歸 蛤蚧 覆盆
6.3 精脫固之
6.3.1 澀滑
　　牡蠣 芡實 金櫻子 五味子 遠志 山茱萸 蛤粉
7 三焦
　　三焦 為相火之用，分佈命門元氣，主升降出入，遊行天地之間，總領五臟六腑營衛經絡內外上下左右之氣，號中清之府。上主納，中主化，下主出。
　　本病：諸熱瞀螈，暴病暴死暴喑，躁擾狂越，譫妄驚駭，諸血溢血泄，諸氣逆沖上，諸瘡瘍痘疹瘤核。
　　上熱則喘滿，諸嘔吐酸，胸痞脅痛，食飲不消，頭上出汗。
　　中熱則善饑而瘦，解 中滿，諸脹腹大，諸病有聲，鼓之如鼓，上下關格不通，霍亂吐利。
　　下熱則暴注下迫，水液混濁，下部腫滿，小便淋瀝或不通，大便閉結下痢。
　　上寒則吐 飲食痰水，胸痹，前後引痛，食已還出。
　　中寒則飲食不化，寒脹，反胃吐水，濕瀉不渴。
　　下寒則二便不禁，臍腹冷，疝痛。
　　標病：惡寒戰慄，如喪神守，耳鳴耳聾，嗌腫喉痹，諸病 腫不用。
7.1 實火瀉之
7.1.1 汗
　　麻黃 柴胡 葛根 荊芥 升麻 薄荷 羌活 石膏
7.1.2 吐
　　瓜蒂 滄鹽 齏汁
7.1.3 下
　　大黃 芒硝
7.2 虛火補之
7.2.1 上
　　人參 天雄 桂心
7.2.2 中
　　人參 黃 丁香 木香 草果
7.2.3 下
　　附子 桂心 硫黃 人參 沉香 烏藥 破故紙
7.3 本熱寒之
7.3.1 上
　　黃芩 連翹 梔子 知母 玄參 石膏 生地黃
7.3.2 中
　　黃連 連翹 生地 石膏
7.3.3 下
　　黃柏 知母 生地 石膏 牡丹 地骨皮
7.4 標熱散之
7.4.1 解表
　　柴胡 細辛 荊芥 羌活 葛根 石膏
8 膽
　　膽 屬木，為少陽相火，發生萬物，為決斷之官，十一髒之主 主同肝。
　　本病：口苦，嘔苦汁，善太息，澹澹如人將捕狀，目昏不眠。
　　標病：寒熱往來， 瘧，胸脅痛，頭額痛，耳痛鳴聾，瘰 結核
8.1 實火瀉之
8.1.1 瀉膽
　　龍膽 牛膝 豬膽 生蕤仁 生酸棗仁 黃連 苦茶
8.2 虛火補之
8.2.1 溫膽
　　人參 細辛 半夏 炒蕤仁 炒酸棗仁 當歸 地黃
8.3 本熱平之
8.3.1 降火
　　黃芩 黃連 芍藥 連翹 甘草
8.3.2 鎮驚
　　黑鉛 水銀
8.4 標熱和之
8.4.1 和解
　　柴胡 芍藥 黃芩 半夏 甘草
9 胃
　　胃 屬土，主容受，為水穀之海。主同脾。
　　本病：噎膈反胃，中滿腫脹，嘔吐瀉痢，霍亂腹痛，消中善饑，不消食，傷飲食，胃管當心痛，支兩脅。
　　標病：發熱蒸蒸，身前熱，身前寒，發狂譫語，咽痹，上齒痛，口眼 斜，鼻痛鼽衄赤。
9.1 胃實瀉之
9.1.1 濕熱
　　大黃 芒硝
9.1.2 飲食
　　巴豆 神曲 山楂 阿魏 砂 郁金 三棱 輕粉
9.2 胃虛補之
9.2.1 濕熱
　　蒼術 白術 半夏 茯苓 橘皮 生薑
9.2.2 寒濕
　　乾薑 附子 草果 官桂 丁香 肉豆蔻 人參 黃
9.3 本熱寒之
9.3.1 降火
　　石膏 地黃 犀角 黃連
9.4 標熱解之
9.4.1 解肌
　　升麻 葛根 豆豉
10 大腸
　　大腸 屬金，主變化，為傳送之官。
　　本病：大便閉結，泄痢下血，裡急後重，疽痔脫肛，腸鳴而痛。
　　標病：齒痛喉痹，頸腫口乾，咽中如核，鼽衄目黃，手大指次指痛，宿食發熱寒栗。
10.1 腸實瀉之
10.1.1 熱
　　大黃 芒硝 桃花 牽牛 巴豆 郁李仁 石膏
10.1.2 氣
　　枳殼 木香 橘皮 檳榔
10.2 腸虛補之
10.2.1 氣
　　皂莢
10.2.2 燥
　　桃仁 麻仁 杏仁 地黃 乳香 松子 當歸 肉蓯蓉
10.2.3 濕
　　白術 蒼術 半夏 硫磺
10.2.4 陷
　　升麻 葛根
10.2.5 脫
　　龍骨 白堊 訶子 粟殼 烏梅 白礬 赤石脂 禹餘糧 石榴皮
10.3 本熱寒之
10.3.1 清熱
　　秦艽 槐角 地黃 黃芩
10.4 本寒溫之
10.4.1 溫裡
　　乾薑 附子 肉豆蔻
10.5 標熱散之
10.5.1 解肌
　　石膏 白芷 升麻 葛根
11 小腸
　　小腸 主分泌水穀，為受盛之官。
　　本病：大便水穀利，小便短，小便閉，小便血，小便自利，大便後血，小腸氣痛，宿食 夜熱旦止。
　　標病：身熱惡寒，嗌痛頷腫，口糜耳聾。
11.1 實熱瀉之
11.1.1 氣
　　木通 豬苓 滑石 瞿麥 澤瀉 燈草
11.1.2 血
　　地黃 蒲黃 赤茯苓 梔子 牡丹皮
11.2 虛寒補之
11.2.1 氣
　　白術 楝實 茴香 砂仁 神曲 扁豆
11.2.2 血
　　桂心 延胡索
11.3 本熱寒之
11.3.1 降火
　　黃柏 黃芩 黃連 連翹 梔子
11.4 標熱散之
11.4.1 解肌
　　本 羌活 防風 蔓荊
12 膀胱
　　膀胱 主津液，為胞之府，氣化乃能出，號州都之官，諸病皆乾之。
　　本病：小便淋瀝，或短數，或黃赤，或白，或遺失，或氣痛。
　　標病：發熱惡寒，頭痛，腰脊強，鼻窒，足小指不用。
12.1 實熱瀉之
12.1.1 泄火
　　滑石 豬苓 澤瀉 茯苓
12.2 下虛補之
12.2.1 熱
　　黃柏 知母
12.2.2 寒
　　桔梗 升麻 益智 烏藥 山茱萸
12.3 本熱利之
12.3.1 降火
　　地黃 梔子 茵陳 黃柏 牡丹皮 地骨皮
12.4 標寒發之
12.4.1 發表
　　麻黃 桂枝 羌活 蒼術 防己 黃 木賊`;

var book = new book_class(originalText);

var simpleChineseUsed = true;

function languageChange(simpleChineseSelected)
{
    let bookName = null;
    if (simpleChineseUsed ^ simpleChineseSelected)
    {
        if (simpleChineseSelected)
        {
            simpleChineseUsed = true;
            book = new book_class(originalText);
            bookName = book.name;
        }
        else
        {
            simpleChineseUsed = false;
            book = new book_class(originalTextTC);
            bookName = book.name;
        }
        book.showLeftList();
        book.itemClick(bookName);
    }
}
