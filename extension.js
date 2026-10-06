game.import("extension", function (lib, game, ui, get, ai, _status) {
    "use strict";
    return {
        name: "沈清辞",
        editable: false,
        content: function (config, pack) {},
        precontent: function () {},
        help: {},
        config: {},
        package: {
            character: {
                character: {
                    shenqingci: ["female", "shen", 6, ["youmingSheling", "nichangTianshou", "luoshuiMfei", "jueyaYazhi"], ["isExtension", "des:沈清辞·万界主宰 —— 阴间终极武将（千年之旅元素）"]],
                },
                translate: {
                    shenqingci: "沈清辞",
                },
            },
            card: { card: {}, translate: {}, list: [] },
            skill: {
                skill: {
                    // ===== 【幽冥蛇灵】白晶晶+白素贞 —— 千年之旅：侵蚀异常 =====
                    youmingSheling: {
                        locked: true,
                        trigger: { player: "useCardToTargeted" },
                        filter: function (event, player) {
                            return event.target && event.target != player && event.target.isIn();
                        },
                        forced: true,
                        popup: false,
                        content: function () {
                            trigger.target.addMark("qn_shiqu", 1, false);
                            trigger.target.addTempSkill("qn_shiqu_effect", { player: "phaseEnd" });
                        },
                        group: ["youmingSheling_dying", "youmingSheling_die", "youmingSheling_nores"],
                        ai: { order: 10 },
                    },
                    qn_shiqu: {
                        mark: true,
                        marktext: "蚀",
                        intro: { name: "侵蚀", content: "回合结束时失去等量体力" },
                    },
                    qn_shiqu_effect: {
                        locked: true,
                        trigger: { player: "phaseEnd" },
                        forced: true,
                        popup: false,
                        filter: function (event, player) { return player.countMark("qn_shiqu") > 0; },
                        content: function () {
                            var n = player.countMark("qn_shiqu");
                            player.removeMark("qn_shiqu", n);
                            player.loseHp(n);
                        },
                    },
                    // 杀不可被响应：额外结算=附加一次雷伤（固定2次结算，避免人数膨胀崩盘）
                    youmingSheling_nores: {
                        locked: true,
                        trigger: { player: "useCardToTargeted" },
                        filter: function (event, player) {
                            return event.card && event.card.name == "sha" && event.target != player;
                        },
                        forced: true,
                        popup: false,
                        content: function () {
                            if (trigger.target && trigger.target.isIn()) trigger.target.damage(trigger.card.nature || "thunder");
                        },
                    },
                    youmingSheling_dying: {
                        locked: true,
                        trigger: { player: "dying" },
                        filter: function (event, player) { return !player.storage.youmingUsed; },
                        forced: true,
                        popup: false,
                        content: function () {
                            "step 0"
                            player.storage.youmingUsed = true;
                            player.recover(player.maxHp);
                            "step 1"
                            game.filterPlayer(function (current) { return current != player; }).forEach(function (t) { t.damage(3, "thunder"); });
                        },
                    },
                    youmingSheling_die: {
                        locked: true,
                        trigger: { player: "dieBefore" },
                        filter: function (event, player) { return !player.storage.youmingRevived; },
                        forced: true,
                        popup: false,
                        content: function () {
                            "step 0"
                            player.storage.youmingRevived = true;
                            game.filterPlayer(function (current) { return current != player; }).forEach(function (t) { t.damage(3, "thunder"); });
                            "step 1"
                            player.maxHp = Math.max(player.maxHp, 6);
                            player.revive(player.maxHp);
                            player.recover(player.maxHp);
                        },
                    },
                    // ===== 【霓裳天授】杨玉环+武则天 —— 千年之旅：生命恢复+灼烧 =====
                    nichangTianshou: {
                        enable: "phaseUse",
                        usable: 1,
                        filter: function (event, player) { return game.hasPlayer(function (c) { return c != player && c.isDamaged(); }); },
                        content: function () {
                            "step 0"
                            event.healed = 0;
                            game.filterPlayer(function (c) { return c != player && c.isDamaged(); }).forEach(function (t) {
                                t.recover(2); event.healed++;
                            });
                            "step 1"
                            if (event.healed > 0) player.draw(event.healed);
                        },
                        ai: { order: 5, result: { player: 1 } },
                        group: ["nichangTianshou_beibei", "nichangTianshou_prevent", "nichangTianshou_zhuoshao"],
                    },
                    nichangTianshou_beibei: {
                        locked: true,
                        trigger: { player: "phaseBegin" },
                        forced: true,
                        popup: false,
                        content: function () {
                            var num = player.countMark("qn_bei") || 0;
                            if (num <= 0) return;
                            player.removeMark("qn_bei", num);
                            player.recover(num);
                            var others = game.filterPlayer(function (c) { return c != player && c.isIn(); });
                            if (others.length) others.randomGet().damage(num, "fire");
                        },
                    },
                    // 伤害防止改回血：阴间核心保留
                    nichangTianshou_prevent: {
                        locked: true,
                        trigger: { player: "damageBegin4" },
                        forced: true,
                        popup: false,
                        content: function () {
                            trigger.cancel();
                            player.recover(trigger.num || 1);
                            player.addMark("qn_bei", 1);
                        },
                    },
                    nichangTianshou_zhuoshao: {
                        locked: true,
                        trigger: { player: "damageSource" },
                        filter: function (event, player) { return event.player && event.player.isIn() && event.player != player; },
                        forced: true,
                        popup: false,
                        content: function () {
                            event.player.addTempSkill("qn_zhuoshao", { player: "phaseEnd" });
                        },
                    },
                    qn_zhuoshao: {
                        mark: true,
                        marktext: "灼",
                        intro: { name: "灼烧", content: "回合结束时失去1点体力" },
                        trigger: { player: "phaseEnd" },
                        forced: true,
                        content: function () { player.loseHp(1); },
                    },
                    // ===== 【洛水宓妃】洛神 —— 千年之旅：绝对防御+闪避 =====
                    // v2修复：不全封锁目标（死循环卡死根因），改为黑色牌不能指定你
                    luoshuiMfei: {
                        locked: true,
                        mod: {
                            targetEnabled: function (card, player, target) {
                                if (target == player && card && get.color(card) == "black") return false;
                            },
                        },
                        trigger: { player: "loseAfter" },
                        filter: function (event, player) {
                            return event.hs && event.hs.length > 0;
                        },
                        forced: true,
                        popup: false,
                        content: function () { player.draw(event.hs.length); },
                        group: ["luoshuiMfei_shan"],
                    },
                    luoshuiMfei_shan: {
                        locked: true,
                        mod: {
                            cardRespondable: function (card, player) {
                                if ((card.name == "shan" || card.name == "wuxie") && player != _status.event.player) return true;
                            },
                        },
                    },
                    // ===== 【绝对压制】无敌核心 —— 千年之旅：定身/沉默 =====
                    jueyaYazhi: {
                        locked: true,
                        trigger: { global: "phaseBegin" },
                        filter: function (event, player) { return event.player != player; },
                        forced: true,
                        popup: false,
                        content: function () {
                            trigger.player.addTempSkill("jueyaYazhi_lock", { player: "phaseEnd" });
                        },
                        mod: {
                            cardUsable: function (card, player, num) { return Infinity; },
                            globalFrom: function (from, to, distance) { return -Infinity; },
                        },
                        group: ["jueyaYazhi_draw", "jueyaYazhi_skillBlock"],
                        ai: { order: 10 },
                    },
                    // v2修复：只锁手牌使用，不锁装备/弃牌，避免UI死循环
                    jueyaYazhi_lock: {
                        locked: true,
                        mark: true,
                        marktext: "压",
                        intro: { content: "被绝对压制：不能使用手牌，非锁定技失效" },
                        mod: {
                            cardEnabled: function (card, player) {
                                if (card && get.position(card) == "h") return false;
                            },
                        },
                        trigger: { player: "phaseBegin" },
                        forced: true,
                        content: function () {
                            var p = player;
                            var skills = p.getSkills ? p.getSkills() : (p.skills || []);
                            skills.forEach(function (s) {
                                var info = lib.skill[s];
                                if (info && !info.locked) p.addSkillBlocker ? null : p.disableSkill(s, "jueyaYazhi_lock");
                            });
                        },
                    },
                    jueyaYazhi_draw: {
                        locked: true,
                        trigger: { player: "phaseDrawBegin2" },
                        forced: true,
                        popup: false,
                        content: function () { trigger.num += 10; },
                    },
                    jueyaYazhi_skillBlock: {
                        locked: true,
                        trigger: { global: "phaseBegin" },
                        filter: function (event, player) { return event.player != player; },
                        forced: true,
                        popup: false,
                        content: function () {
                            var p = trigger.player;
                            var skills = p.getSkills ? p.getSkills() : (p.skills || []);
                            skills.forEach(function (s) {
                                var info = lib.skill[s];
                                if (info && !info.locked && !info.charlotte) p.disableSkill(s);
                            });
                        },
                    },
                },
                translate: {
                    youmingSheling: "幽冥蛇灵",
                    youmingSheling_info: "锁定技，融合白晶晶与白素贞。你的【杀】不可被【闪】响应且额外结算一次（附加雷伤）；你使用牌指定其他角色后，其获得一枚\"蚀\"标记（侵蚀），其回合结束时失去等量体力。当你进入濒死状态时，你立即回复所有体力，然后对所有其他角色造成3点雷电伤害（每局限一次）。你死亡时，视为发动一次濒死效果，然后你满血复活（每局限一次）。",
                    nichangTianshou: "霓裳天授",
                    nichangTianshou_info: "出牌阶段限一次，你可以令所有其他受伤角色各回复2点体力，然后你摸X张牌（X为因此回复体力的角色数）。锁定技，你每次受到伤害时防止之，改为回复等量体力并获得一枚\"碑\"标记；你的回合开始时，移去所有\"碑\"标记，你回复等量体力并对一名其他角色造成等量火焰伤害；你造成伤害后，受伤者获得\"灼\"（灼烧），其回合结束时失去1点体力。",
                    luoshuiMfei: "洛水宓妃",
                    luoshuiMfei_info: "锁定技，融合洛神。黑色牌不能指定你（绝对防御）；当你的手牌被弃置时，你摸等量的牌；你的回合外，当你需要使用【闪】或【无懈可击】时，你视为拥有并可以使用之。",
                    jueyaYazhi: "绝对压制",
                    jueyaYazhi_info: "锁定技，无敌核心。其他角色的回合开始时，你令其本回合内不能使用手牌（定身），其所有非锁定技失效（沉默）；你的回合内，你使用牌无次数限制、无距离限制，且你摸牌阶段额外摸10张牌。",
                    qn_shiqu: "侵蚀",
                    qn_zhuoshao: "灼烧",
                    jueyaYazhi_lock: "绝对压制",
                },
            },
            intro: "沈清辞 —— 万界主宰（阿清自制·阴间终极武将·千年之旅元素）",
            author: "阿清×迪布赛格",
            diskURL: "",
            forumURL: "",
            version: "2.0",
        },
        files: { character: ["shenqingci.jpg"], card: [], skill: [], audio: [] },
    };
});
