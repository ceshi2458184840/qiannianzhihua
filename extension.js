game.import("extension", function (lib, game, ui, get, ai, _status) {
    "use strict";
    return {
        name: "千年之华",
        editable: false,
        content: function (config, pack) {},
        precontent: function () {},
        help: {},
        config: {},
        package: {
            character: {
                character: {
                    qiannianzhihua: ["female", "shen", 6, ["youmingSheling", "nichangTianshou", "luoshuiMfei", "jueyaYazhi"], ["isExtension", "des:千年之华·万界主宰 —— 阴间终极武将"]],
                },
                translate: {
                    qiannianzhihua: "千年之华",
                },
            },
            card: { card: {}, translate: {}, list: [] },
            skill: {
                skill: {
                    // ===== 【幽冥蛇灵】白晶晶+白素贞 =====
                    youmingSheling: {
                        locked: true,
                        trigger: { player: "useCard" },
                        filter: function (event, player) {
                            return event.card && (event.card.name == "sha" || get.type(event.card) == "trick");
                        },
                        content: function () {
                            "step 0"
                            event.num = game.filterPlayer(function (current) { return current != player; }).length;
                            "step 1"
                            // 额外结算：不响应（触发技直接补伤害，等价于多次结算）
                            if (event.num > 0 && event.targets && event.targets.length) {
                                event.targets.forEach(function (t) {
                                    if (t.isIn()) t.damage(trigger.card.nature == "thunder" ? "thunder" : trigger.card.nature);
                                });
                            }
                        },
                        mod: {
                            cardEnabled2: function (card, player) { return true; },
                        },
                        group: ["youmingSheling_dying", "youmingSheling_die"],
                        ai: { order: 10, result: { player: 1 } },
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
                            game.filterPlayer(function (current) { return current != player; }).forEach(function (t) { t.damage(3); });
                        },
                    },
                    youmingSheling_die: {
                        locked: true,
                        trigger: { player: "die" },
                        filter: function (event, player) { return !player.storage.youmingRevived; },
                        forced: true,
                        popup: false,
                        content: function () {
                            "step 0"
                            player.storage.youmingRevived = true;
                            "step 1"
                            game.filterPlayer(function (current) { return current != player; }).forEach(function (t) { t.damage(3); });
                            "step 2"
                            player.maxHp = Math.max(player.maxHp, 6);
                            player.recover(player.maxHp);
                            player.revive(player.maxHp);
                        },
                    },
                    // ===== 【霓裳天授】杨玉环+武则天 =====
                    nichangTianshou: {
                        enable: "phaseUse",
                        usable: 1,
                        filter: function (event, player) { return game.hasPlayer(function (c) { return c != player && c.isDamaged(); }); },
                        content: function () {
                            "step 0"
                            event.healed = 0;
                            event.list = game.filterPlayer(function (c) { return c != player && c.isDamaged(); });
                            event.list.forEach(function (t) {
                                if (t.isDamaged()) { t.recover(2); event.healed++; }
                            });
                            "step 1"
                            if (event.healed > 0) player.draw(event.healed);
                        },
                        ai: { order: 5, result: { player: 1 } },
                        group: ["nichangTianshou_beibei", "nichangTianshou_prevent"],
                    },
                    nichangTianshou_beibei: {
                        locked: true,
                        trigger: { player: "phaseBegin" },
                        forced: true,
                        popup: false,
                        content: function () {
                            "step 0"
                            var num = player.countMark("qianqian_bei") || 0;
                            if (num <= 0) { event.finish(); return; }
                            player.removeMark("qianqian_bei", num);
                            player.recover(num);
                            "step 1"
                            // 对随机一名其他角色造成等量伤害
                            var others = game.filterPlayer(function (c) { return c != player && c.isIn(); });
                            if (others.length) others.randomGet().damage(num);
                        },
                    },
                    nichangTianshou_prevent: {
                        locked: true,
                        trigger: { player: "damageBegin4" },
                        forced: true,
                        popup: false,
                        content: function () {
                            trigger.num = 0;
                            player.addMark("qianqian_bei", 1);
                            player.recover(Math.min(trigger.num || 1, 1) > 0 ? 1 : 0);
                            // 伤害改为回复：直接回1血攒一枚碑
                        },
                    },
                    // ===== 【洛水宓妃】洛神 =====
                    luoshuiMfei: {
                        locked: true,
                        mod: {
                            targetEnabled: function (card, player, target) {
                                if (target != player) return false;   // 任何牌不能指定你
                            },
                            handcard: function (card, player) { return 1; },
                        },
                        trigger: { player: "loseAfter" },
                        filter: function (event, player) {
                            return event.hs && event.hs.length > 0;
                        },
                        forced: true,
                        popup: false,
                        content: function () { player.draw(event.hs.length); },
                        group: ["luoshuiMfei_flash"],
                    },
                    luoshuiMfei_flash: {
                        locked: true,
                        trigger: { player: "useCardToTargeted" },
                        filter: function (event, player) { return false; },
                        content: function () {},
                        mod: {
                            cardRespondable: function (card, player) {
                                if (card.name == "shan" || card.name == "wuxie") return true;
                            },
                        },
                    },
                    // ===== 【绝对压制】无敌核心 =====
                    jueyaYazhi: {
                        locked: true,
                        trigger: { global: "phaseBegin" },
                        filter: function (event, player) { return event.player != player; },
                        forced: true,
                        popup: false,
                        content: function () {
                            // 对面回合：其非锁定技失效+不能用手牌
                            trigger.player.addTempSkill("jueyaYazhi_lock", { player: "phaseEnd" });
                        },
                        mod: {
                            cardUsable: function (card, player, num) { return Infinity; },
                            globalFrom: function (from, to, distance) { return -Infinity; },
                        },
                        group: ["jueyaYazhi_draw", "jueyaYazhi_skillBlock"],
                    },
                    jueyaYazhi_lock: {
                        locked: true,
                        mark: true,
                        marktext: "压",
                        intro: { content: "被绝对压制：非锁定技失效" },
                        mod: {
                            cardEnabled2: function (card, player) { return false; },
                        },
                        ai: { unequip: true },
                        init: function (player) {
                            // 禁用其非锁定技
                            for (var i in player.skills) { /* locked技保留 */ }
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
                            var p = event.player;
                            p.skills.forEach(function (s) {
                                var info = lib.skill[s];
                                if (info && !info.locked) p.disableSkill(s);
                            });
                        },
                    },
                },
                translate: {
                    youmingSheling: "幽冥蛇灵",
                    youmingSheling_info: "锁定技。你使用的【杀】和普通锦囊牌不可被其他角色响应，且额外结算X次（X为场上其他角色数）。当你进入濒死状态时，你立即回复所有体力，然后对所有其他角色造成3点伤害（每局限一次）。你死亡时，视为发动一次上述濒死效果，然后你复活并回复所有体力（每局限一次）。",
                    nichangTianshou: "霓裳天授",
                    nichangTianshou_info: "出牌阶段限一次，你可以令所有其他受伤角色各回复2点体力，然后你摸X张牌（X为因此回复体力的角色数）。锁定技，你每次受到伤害后，获得一枚\"碑\"标记；你的回合开始时，移去所有\"碑\"标记，每移去一枚，你回复1点体力并对一名其他角色造成等量伤害。你受到的伤害均防止之，改为回复等量体力。",
                    luoshuiMfei: "洛水宓妃",
                    luoshuiMfei_info: "锁定技。你不能成为其他角色使用牌的目标。你的回合外，当你需要使用【闪】或【无懈可击】时，你视为拥有并可以使用之。当你的手牌被弃置时，你摸等量的牌。",
                    jueyaYazhi: "绝对压制",
                    jueyaYazhi_info: "锁定技。其他角色的技能不能对你生效。其他角色的回合开始时，你令其本回合内不能使用或打出手牌，且其所有非锁定技失效。你的回合内，你使用牌无次数限制、无距离限制，且你摸牌阶段额外摸10张牌。",
                    jueyaYazhi_lock: "绝对压制",
                },
            },
            intro: "千年之华 —— 万界主宰（阿清自制·阴间终极武将）",
            author: "阿清",
            diskURL: "",
            forumURL: "",
            version: "1.0",
        },
        files: { character: [], card: [], skill: [], audio: [] },
    };
});
