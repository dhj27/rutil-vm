<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script type="text/javascript">

<% 
	String id = (String)session.getAttribute("userId");
%>

</script>

<!-- websocket vue -->
<div id="wsVue"></div>
<!-- /websocket vue -->

<!-- top navigation -->
<div class="top_nav">
	<div class="nav_menu">
		<nav>
			<div class="nav toggle">
				<a id="menu_toggle"><i class="fa fa-bars"></i></a>
			</div>
			<ul class="nav navbar-nav navbar-right">
				<li class="">
					<a href="javascript:;" class="user-profile dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><%=id %> <span class=" fa fa-angle-down"></span></a>
					<ul class="dropdown-menu dropdown-usermenu pull-right">
						<!-- <li><a href="javascript:;"> Profile</a></li> -->
						<li><a href="/logout"><i class="fa fa-sign-out pull-right"></i> 로그아웃</a></li>
					</ul>
				</li>
				<!-- <li role="presentation" class="dropdown">
					<a href="javascript:;" class="dropdown-toggle info-number" data-toggle="dropdown" aria-expanded="false"> Events <span class="badge bg-green">3</span></a>
					<ul id="menu1" class="dropdown-menu list-unstyled msg_list" role="menu">
						<li><a>
							<span>
								<span>사용자01</span>
								<span class="time">3 mins ago</span>
							</span>
								<span class="message"> Event01 이벤트 내용이 표시됩니다. 이벤트 내용이 표시됩니다. 이벤트 내용이 표시됩니다. </span>
						</a></li>
						<li>
							<div class="text-center">
								<a> <strong>See All Alerts</strong> <i class="fa fa-angle-right"></i></a>
							</div>
						</li>
					</ul>
				</li> -->
			</ul>
		</nav>
	</div>
</div>
<!-- /top navigation -->
