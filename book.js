'use strict';

class book_class
{
    bookText = "";
    name = "";
    organClasses = new Array();
    remediesPositions = new Map();//<name, positionArray>
    subRemediesPositions = new Map();
    herbsPositions = new Map();

    constructor(text)
    {
        //this.bookText = text;
        this.name = text.substring(0, text.indexOf('\n')).trim();
        let splitedOrgans = text.split(/^[0-9]+\s/m);
        for (var i = 1; i < splitedOrgans.length; i++)
        {
            this.organClasses.push(new organ_class(splitedOrgans[i]));
        }
        this.parsePosition();
    }

    parsePosition()
    {
        for (let organ of this.organClasses)
        {
            for (let remedy of organ.remedies)
            {
                this.addPositionIntoMap(this.remediesPositions, remedy.name, new position_class(organ));
                for (let subRemedy of remedy.subRemedies)
                {
                    this.addPositionIntoMap(this.subRemediesPositions, subRemedy.name, new position_class(organ, remedy));
                    for (let herb of subRemedy.herbs)
                    {
                        this.addPositionIntoMap(this.herbsPositions, herb, new position_class(organ, remedy, subRemedy));
                    }
                }
            }
        }

        //console.log(`这是一个${this.name}，${this.description}`);
    }

    addPositionIntoMap(map, key, position)
    {
        let positionArray = map.get(key);
        if (positionArray == undefined)
        {
            let newPositionArray = new Array();
            newPositionArray.push(position);
            map.set(key, newPositionArray);
        }
        else
        {
            positionArray.push(position);
        }
    }

}
 //定义一个脏器类
class organ_class
{
    organText=""
    name = "";
    description = "";
    remedies = new Array();
    // 构造函数
    constructor(splitedOrignalText)
    {
        //this.organText = splitedOrignalText;
        let splitedRemedies = splitedOrignalText.split(/^[0-9]+.[0-9]+\s/m);
        this.name = splitedOrignalText.substring(0, splitedOrignalText.indexOf('\n')).trim();
        this.description = splitedOrignalText.substring(splitedOrignalText.indexOf('\n') + 1).trim();
        for (var i = 1; i < splitedRemedies.length; i++)
        {
            this.remedies.push(new remedy_class(splitedRemedies[i]));
        }


    }
}

class remedy_class
{
    remedyText = "";
    name = "";
    subRemedies = new Array();
    constructor(splitedRemedyText)
    {
        //this.remedyText = splitedRemedyText;
        let splitedSubRemedies = splitedRemedyText.split(/^[0-9]+.[0-9]+.[0-9]+\s/m);
        this.name = splitedSubRemedies[0].substring(0, splitedSubRemedies[0].indexOf('\n')).trim();
        for (var i = 1; i < splitedSubRemedies.length; i++)
        {
            this.subRemedies.push(new subRemedy_class(splitedSubRemedies[i]));
        }


    }

}

class subRemedy_class
{
    subRemedyText = "";
    name = "";
    herbs = new Array();
    constructor(splitedSubRemedyText)
    {
        //this.subRemedyText = splitedSubRemedyText;
        this.name = splitedSubRemedyText.substring(0, splitedSubRemedyText.indexOf('\n'));
        let herbText = splitedSubRemedyText.substring(splitedSubRemedyText.indexOf('\n') + 1).trim();
        this.herbs = herbText.split(/\s+/);
    }
}

class position_class
{
    organ = null;
    remedy = null;
    subRemedy = null;
    constructor(org, remd, subRme)
    {
        this.organ = org;
        this.remedy = remd;
        this.subRemedy = subRme;
    }
}

var originalText = `《脏腑虚实标本用药式》
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
　　羌活 荆芥 薄荷 槐子 蔓荆子 白花蛇 独活 防风 皂荚 乌头 白附子僵蚕 蝉蜕
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

let book = new book_class(originalText);
